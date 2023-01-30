const { Regex } = require('@companion-module/base')
module.exports = {
	actions() {
		let self = this

		const re_meSource_meNumber = '/^(ME|MME|MSC):[0-9]{1,2}$/'

		const sendCommand = async (action) => {
			if (cmd !== undefined) {
				self.log('debug', 'sending tcp', cmd, 'to', self.config.host)

				if (self.socket !== undefined && self.socket.connected) {
					await self.socket.send(cmd + '\r\n')
					if (!self.config.keepAlive) {
						self.socket = self.init_tcp()
					}
				} else {
					self.log('debug', 'Socket not connected :(')
				}
			}

			self.log('debug', 'action():', action)
		}

		let actions = {
			gpi: {
				name: 'Trigger GPI',
				options: [
					{
						type: 'textinput',
						label: 'Number',
						id: 'gpi',
						default: '1',
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var gpi = parseInt(opt.gpi)
					cmd =
						'GPI ' + (gpi <= 9 && (self.config.model == 'carbonite' || self.config.model == 'acuity') ? '0' : '') + gpi
					sendCommand(cmd)
				},
			},

			gpiByName: {
				name: 'Trigger GPI by Name',
				options: [
					{
						type: 'textinput',
						label: 'Name',
						id: 'gpi',
					},
					{
						type: 'textinput',
						label: 'Parameter',
						id: 'parameter',
					},
				],
				callback: async (event) => {
					let opt = event.options
					if (opt.parameter === null) {
						cmd = 'GPI ' + opt.gpi
					} else {
						cmd = 'GPI ' + opt.gpi + ':' + opt.parameter
					}
					sendCommand(cmd)
				},
			},

			custom: {
				name: 'Send a custom command',
				description: 'Refer to RossTalk Guide',
				options: [
					{
						type: 'textinput',
						label: 'Command',
						id: 'cmd',
					},
				],
				callback: async (event) => {
					let opt = event.options
					sendCommand(opt.cmd)
				},
			},
		}
		if (self.config.model == 'carbonite') {
			actions.cc = {
				name: 'Fire custom control',
				options: [
					{
						type: 'textinput',
						label: 'CC Bank',
						id: 'bank',
						default: '1',
						regex: Regex.NUMBER,
					},
					{
						type: 'textinput',
						label: 'CC Number',
						id: 'cc',
						default: '1',
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var cc = parseInt(opt.cc)
					cmd = 'CC ' + parseInt(opt.bank) + ':' + (cc > 9 ? '' : '0') + cc
					sendCommand(cmd)
				},
			}
			actions.loadset = {
				name: 'Load Set',
				options: [
					{
						type: 'textinput',
						label: 'Set name',
						id: 'set',
						default: 'set1',
					},
				],
				callback: async (event) => {
					let opt = event.options
					cmd = 'LOADSET ' + opt.set
					sendCommand(cmd)
				},
			}

			actions.cut = {
				name: 'Cut',
				options: [
					{
						type: 'textinput',
						label: 'MLE',
						id: 'mle',
						default: 'ME:1',
						regex: re_meSource_meNumber,
					},
				],
				callback: async (event) => {
					let opt = event.options
					cmd = 'MECUT ' + opt.mle
					sendCommand(cmd)
				},
			}
			actions.autotrans = {
				name: 'Auto Transition',
				options: [
					{
						type: 'textinput',
						label: 'MLE',
						id: 'mle',
						default: 'ME:1',
						regex: re_meSource_meNumber,
					},
				],
				callback: async (event) => {
					let opt = event.options
					cmd = 'MEAUTO ' + opt.mle
					sendCommand(cmd)
				},
			}
			actions.xpt = {
				name: 'XPT',
				options: [
					{
						type: 'textinput',
						label: 'Destination',
						id: 'vidDest',
						default: 'ME:1:PGM',
						tooltip:
							'Program - ME:(ME-number):PGM, AuxBus — AUX:(aux-number), Key — ME:(ME-number):KEY:(key-number), MiniME™ — MME:(ME-number), Preset — ME:(ME-number):PST',
					},
					{
						type: 'textinput',
						label: 'Source',
						id: 'vidSource',
						default: 'IN:20',
						tooltip:
							'Aux Bus — AUX:(aux-number), Black — BK, Clean — ME:(ME-number):CLN, Input Source — IN:(input-number), Key — ME:(ME-number):KEY:(key-number), Matte Color — BG, Media-Store — MS:(channel-number), MiniME™ — MME:(ME-number), Preview — ME:(ME-number):PV, Program — ME:(ME-number):PGM, [Graphite only], Chroma Key Video — CK:(chroma key number) [UltraChromeHR, or Carbonite Black v14.0 or higher only], Chroma Key Alpha — CKA:(chroma key number) [UltraChromeHR, or Carbonite Black v14.0 or higher only]',
					},
				],
				callback: async (event) => {
					let opt = event.options
					var src = opt.vidSource
					var dst = opt.vidDest
					cmd = 'XPT ' + dst + ':' + src
					console.log('ross xpt:', cmd)
					sendCommand(cmd)
				},
			}
			actions.transKey = {
				name: 'Transition Keyer',
				options: [
					{
						type: 'textinput',
						label: 'MLE',
						id: 'mle',
						default: 'ME:1',
						regex: re_meSource_meNumber,
					},
					{
						type: 'textinput',
						label: 'Keyer',
						id: 'key',
						default: 1,
						regex: Regex.NUMBER,
					},
					{
						type: 'dropdown',
						label: 'Transition On/Off Air ',
						id: 'transD',
						default: 'TOGGLE',
						choices: [
							{ id: 'TOGGLE', label: 'Toggle Keyer' },
							{ id: 'ON', label: 'Transition OnAir' },
							{ id: 'OFF', label: 'Transition OffAir' },
						],
					},
					{
						type: 'dropdown',
						label: 'Transition type',
						id: 'transT',
						default: 'CUT',
						choices: [
							{ id: 'AUTO', label: 'Auto Transition' },
							{ id: 'CUT', label: 'Cut Transition ' },
						],
					},
				],
				callback: async (event) => {
					let opt = event.options
					if (opt.transD === 'TOGGLE') {
						cmd = 'KEY' + opt.transT + ' ' + opt.mle + ':' + opt.key
					} else {
						cmd = 'KEY' + opt.transT + opt.transD + ' ' + opt.mle + ':' + opt.key
					}
					sendCommand(cmd)
				},
			}
			actions.ftb = {
				label: 'Fade to black',
				options: [],
				callback: async (event) => {
					cmd = 'FTB'
					sendCommand(cmd)
				},
			}

			actions.MEM = {
				name: 'MEM',
				options: [
					{
						type: 'textinput',
						label: 'Memory ID',
						id: 'memID',
						default: '1:1',
						regex: '/^[0-9]{1,2}(:(ME|MME|MSC):[0-9]{1,2})+$/',
					},
				],
				callback: async (event) => {
					let opt = event.options
					var memID = opt.memID
					cmd = 'MEM ' + memID
					sendCommand(cmd)
				},
			}
			actions.SEQI = {
				name: 'SEQI',
				options: [
					{
						type: 'textinput',
						label: 'take ID',
						id: 'takeID',
						default: 0,
						regex: Regex.NUMBER,
					},
					{
						type: 'textinput',
						label: 'Layer',
						id: 'Layer',
						default: 0,
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var takeID = opt.takeID
					var layer = opt.layer
					cmd = 'SEQI ' + takeID + ':' + layer
					sendCommand(cmd)
				},
			}
			actions.SEQO = {
				name: 'SEQO',
				options: [
					{
						type: 'textinput',
						label: 'take ID',
						id: 'takeID',
						default: 0,
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var takeID = opt.takeID
					cmd = 'SEQO ' + takeID
					sendCommand(cmd)
				},
			}
		}
		if (self.config.model == 'acuity') {
			actions.cc = {
				name: 'Fire custom control',
				options: [
					{
						type: 'textinput',
						label: 'CC Bank',
						id: 'bank',
						default: '1',
						regex: Regex.NUMBER,
					},
					{
						type: 'textinput',
						label: 'CC Number',
						id: 'cc',
						default: '1',
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var cc = parseInt(opt.cc)
					cmd = 'CC ' + parseInt(opt.bank) + ':' + (cc > 9 ? '' : '0') + cc
					sendCommand(cmd)
				},
			}
			actions.transKey = {
				name: 'Transition Keyer',
				options: [
					{
						type: 'textinput',
						label: 'MLE',
						id: 'mle',
						default: 'ME:1',
						regex: re_meSource_meNumber,
					},
					{
						type: 'textinput',
						label: 'Keyer',
						id: 'key',
						default: 1,
						regex: Regex.NUMBER,
					},
					{
						type: 'dropdown',
						label: 'Transition type',
						id: 'transT',
						default: 'CUT',
						choices: [
							{ id: 'AUTO', label: 'Auto Transition' },
							{ id: 'CUT', label: 'Cut Transition ' },
						],
					},
				],
				callback: async (event) => {
					let opt = event.options
					cmd = 'KEY' + opt.transT + ' ' + opt.mle + ':' + opt.key
					sendCommand(cmd)
				},
			}
			actions.loadset = {
				name: 'Load Set',
				options: [
					{
						type: 'dropdown',
						label: 'Load Location',
						id: 'location',
						default: 'USB',
						choices: [
							{ id: 'USB', label: 'USB' },
							{ id: 'HD', label: 'HD' },
						],
					},
					{
						type: 'textinput',
						label: 'Set name',
						id: 'set',
						default: 'set1',
					},
				],
				callback: async (event) => {
					let opt = event.options
					cmd = 'LOADSET ' + opt.location + ':' + opt.set
					sendCommand(cmd)
				},
			}

			actions.cut = {
				name: 'Cut',
				options: [
					{
						type: 'textinput',
						label: 'MLE',
						id: 'mle',
						default: '1',
					},
				],
				callback: async (event) => {
					let opt = event.options
					cmd = 'MECUT ' + opt.mle
					sendCommand(cmd)
				},
			}
			actions.ftb = {
				label: 'Fade to black',
				options: [],
				callback: async (event) => {
					cmd = 'FTB'
					sendCommand(cmd)
				},
			}

			actions.MEM = {
				name: 'MEM',
				options: [
					{
						type: 'textinput',
						label: 'Memory ID',
						id: 'memID',
						default: '1:1',
						regex: '/^[0-9]{1,2}|?(:[0-9]{1,2})+$/',
					},
				],
				callback: async (event) => {
					let opt = event.options
					var memID = opt.memID
					cmd = 'MEM ' + memID
					sendCommand(cmd)
				},
			}

			actions.autotrans = {
				name: 'Auto Transition',
				options: [
					{
						type: 'textinput',
						label: 'MLE',
						id: 'mle',
						default: '1',
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					cmd = 'MEAUTO ' + opt.mle
					sendCommand(cmd)
				},
			}

			actions.xpt = {
				name: 'XPT',
				options: [
					{
						type: 'textinput',
						label: 'Destination',
						id: 'vidDest',
						default: 'ME:1:PGM',
						tooltip:
							'Program - ME:(ME-number):PGM, AuxBus — AUX:(aux-number), Key — ME:(ME-number):KEY:(key-number), MiniME™ — MME:(ME-number), Preset — ME:(ME-number):PST',
					},
					{
						type: 'textinput',
						label: 'Source',
						id: 'vidSource',
						default: 'IN:20',
						tooltip:
							'Aux Bus — AUX:(aux-number), Black — BK, Clean — ME:(ME-number):CLN, Input Source — IN:(input-number), Key — ME:(ME-number):KEY:(key-number), Matte Color — BG, Media-Store — MS:(channel-number), MiniME™ — MME:(ME-number), Preview — ME:(ME-number):PV, Program — ME:(ME-number):PGM, [Graphite only], Chroma Key Video — CK:(chroma key number) [UltraChromeHR, or Carbonite Black v14.0 or higher only], Chroma Key Alpha — CKA:(chroma key number) [UltraChromeHR, or Carbonite Black v14.0 or higher only]',
					},
				],
				callback: async (event) => {
					let opt = event.options
					var src = opt.vidSource
					var dst = opt.vidDest
					cmd = 'XPT ' + dst + ':' + src
					console.log('ross xpt:', cmd)
					sendCommand(cmd)
				},
			}
		}
		if (self.config.model == 'ultrix') {
			actions.TIMER = {
				name: 'Ultrix Timer',
				options: [
					{
						type: 'dropdown',
						label: 'Action type',
						id: 'timerAction',
						default: 'RUN',
						choices: [
							{ id: 'RUN', label: 'Run Timer' },
							{ id: 'PAUSE', label: 'Pause Timer' },
							{ id: 'STOP', label: 'Stop Timer' },
							{ id: 'END', label: 'End Timer' },
						],
					},
					{
						type: 'textinput',
						label: 'Timer Number',
						id: 'timerID',
						default: 0,
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var timerAction = opt.timerAction
					var timerID = parseInt(opt.timerID)
					cmd = 'TIMER ' + timerID + ':' + timerAction
					sendCommand(cmd)
				},
			}
		}
		if (self.config.model == 'opengear') {
			actions.ftb = {
				label: 'Fade to black',
				description: 'Not supported on the MDK-111A-K.',
				options: [],
				callback: async (event) => {
					cmd = 'FTB'
					sendCommand(cmd)
				},
			}

			actions.transKey = {
				name: 'Transition Keyer',
				options: [
					{
						type: 'textinput',
						label: 'MLE',
						id: 'mle',
						default: 'ME:1',
						regex: re_meSource_meNumber,
					},
					{
						type: 'textinput',
						label: 'Keyer',
						id: 'key',
						default: 1,
						regex: Regex.NUMBER,
					},
					{
						type: 'dropdown',
						label: 'Transition type',
						id: 'transT',
						default: 'CUT',
						choices: [
							{ id: 'AUTO', label: 'Auto Transition' },
							{ id: 'CUT', label: 'Cut Transition ' },
						],
					},
				],
				callback: async (event) => {
					let opt = event.options
					cmd = 'KEY' + opt.transT + ' ' + opt.mle + ':' + opt.key
					sendCommand(cmd)
				},
			}
		}

		this.setActionDefinitions(actions)
	},
}
