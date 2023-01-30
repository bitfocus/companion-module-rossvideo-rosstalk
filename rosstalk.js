const { TCPHelper, InstanceBase, runEntrypoint } = require('@companion-module/base')

const config = require('./src/config')
const actions = require('./src/actions')
const upgrades = require('./src/upgrades')

class RossTalkInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		let self = this
		// Assign the methods from the listed files to this class
		Object.assign(self, {
			...config,
			...actions,
		})
	}

	static GetUpgradeScripts() {
		return [upgrades.legacy_upgrade]
	}

	async init(config) {
		let self = this
		self.config = config

		self.configUpdated(config)

		self.updateStatus('connecting', 'Waiting To Connect')
		self.init_tcp()
	}

	async configUpdated(config) {
		let self = this
		self.config = config
		self.actions()
		self.init_tcp()
	}

	init_tcp() {
		var self = this

		if (self.socket !== undefined) {
			self.socket.destroy()
			delete self.socket
		}

		if (self.config.host) {
			if (self.config.port === undefined) {
				self.config.port = 7788
			}
			self.socket = new TCPHelper(self.config.host, self.config.port)

			self.socket.on('status_change', function (status, message) {
				self.updateStatus(status, message)
			})

			self.socket.on('error', function (err) {
				self.log('debug', 'Network error', err)
				self.updateStatus('error', err)
				self.log('error', 'Network error: ' + err.message)
			})

			self.socket.on('connect', function () {
				self.updateStatus('ok')
				self.log('debug', 'Connected')
			})

			self.socket.on('data', function (data) {})
		}
	}

	// When module gets deleted
	async destroy() {
		var self = this

		if (self.socket !== undefined) {
			self.socket.destroy()
		}

		self.log('debug', 'destroy', self.id)
	}
}

runEntrypoint(RossTalkInstance, RossTalkInstance.GetUpgradeScripts())
