const { TCPHelper, InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')

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

		self.updateStatus('connecting', 'Waiting To Connect')
		await self.configUpdated(config)
	}

	async configUpdated(config) {
		let self = this
		self.config = config
		self.actions()

		if (self.config.keepAlive) {
			self.init_tcp();
		}
		else {
			self.updateStatus(InstanceStatus.Ok);
		}
	}

	init_tcp(cmd) {
		var self = this

		if (self.socket !== undefined) {
			self.socket.destroy()
			delete self.socket
		}

		self.log('debug', 'Opening socket.');

		if (self.config.host) {
			if (self.config.port === undefined) {
				self.config.port = 7788
			}
			self.socket = new TCPHelper(self.config.host, self.config.port)

			self.socket.on('status_change', function (status, message) {
				if (status !== 'unknown_error') {
					self.updateStatus(status, message)
				}
			})

			self.socket.on('error', function (err) {
				self.log('debug', 'Network error', JSON.stringify(err))
				self.updateStatus('error', err.code)
				self.log('error', 'Network error: ' + err.message)
			})

			self.socket.on('connect', function () {
				self.updateStatus(InstanceStatus.Ok)
				self.log('debug', 'Connected')
				if (cmd !== undefined) {
					self.log('debug', `sending tcp ${cmd} to ${self.config.host}`);
					self.socket.send(cmd + '\r\n');

					if (!self.config.keepAlive) {
						self.log('debug', 'Closing socket.');
						self.socket.destroy()
						delete self.socket
					}
				}
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
