const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const net = require('node:net')
const { createRequire } = require('node:module')
const path = require('node:path')
const actions = require('../src/actions')
const base = require('@companion-module/base')

// Capture the entrypoint without starting a Companion IPC session.
const filename = path.join(__dirname, '../rosstalk.js')
const localRequire = createRequire(filename)
let Instance
vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
	require: (id) => id === '@companion-module/base'
		? { ...base, runEntrypoint: (value) => { Instance = value } }
		: localRequire(id),
})

const context = {
	// API 1.13+ delivers useVariables text fields already parsed by the host.
	parseVariablesInString: async (value) => {
		return value
	},
}

function instance(model, keepAlive) {
	const self = Object.create(Instance.prototype)
	Object.assign(self, actions, {
		config: { model, keepAlive },
		log() {},
		updateStatus() {},
		setActionDefinitions(definitions) { this.definitions = definitions },
	})
	self.actions()
	return self
}

test('model-specific actions preserve RossTalk commands and CRLF framing', async () => {
	for (const model of ['carbonite', 'acuity', 'ultrix', 'opengear']) {
		const self = instance(model, true)
		const sent = []
		self.socket = { isConnected: true, send: (value) => sent.push(value) }
		await self.definitions.gpi.callback({ options: { gpi: '7' } }, context)
		await self.definitions.custom.callback({ options: { cmd: 'CUSTOM test' } }, context)
		assert.deepEqual(sent, [
			`GPI ${['carbonite', 'acuity'].includes(model) ? '07' : '7'}\r\n`,
			'CUSTOM test\r\n',
		])
	}
	const self = instance('carbonite', true)
	const sent = []
	self.socket = { isConnected: true, send: (value) => sent.push(value) }
	await self.definitions.cc.callback({ options: { bank: '2', cc: '3' } }, context)
	assert.deepEqual(sent, ['CC 2:03\r\n'])
})

test('disconnected persistent connection drops actions without throwing', async () => {
	const self = instance('carbonite', true)
	await self.definitions.custom.callback({ options: { cmd: 'CUT ME:1' } }, context)
})

test('one-shot actions transmit through the real SDK TCPHelper to a local receiver', async (t) => {
	const sockets = new Set()
	let received = ''
	let finish
	const result = new Promise((resolve) => { finish = resolve })
	const server = net.createServer((socket) => {
		sockets.add(socket)
		socket.on('data', (data) => {
			received += data.toString()
			if (received.endsWith('\r\n')) finish(received)
		})
	})
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
	const self = instance('carbonite', false)
	t.after(async () => {
		await self.destroy()
		for (const socket of sockets) socket.destroy()
		await new Promise((resolve) => server.close(resolve))
	})
	self.config.host = '127.0.0.1'
	self.config.port = server.address().port
	await self.definitions.custom.callback({ options: { cmd: 'CUT ME:1' } }, context)
	assert.equal(await result, 'CUT ME:1\r\n')
})
