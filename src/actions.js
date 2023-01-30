const { Regex } = require('@companion-module/base')
module.exports = {
	actions() {
		let self = this

		const sendCommand = async (action) => {
			if (cmd !== undefined) {
				self.log('debug', 'sending tcp', cmd, 'to', self.config.host)

				if (self.socket !== undefined && self.socket.connected) {
					await self.socket.send(cmd + '\r\n')
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
					cmd = 'GPI ' + (gpi > 9 ? '' : '0') + gpi
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

			cc: {
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
			},

			loadset: {
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
			},

			cut: {
				name: 'Cut',
				options: [
					{
						type: 'textinput',
						label: 'MLE',
						id: 'mle',
						default: 'ME:1',
					},
				],
				callback: async (event) => {
					let opt = event.options
					cmd = 'MECUT ' + opt.mle
					sendCommand(cmd)
				},
			},

			autotrans: {
				name: 'Auto Transition',
				options: [
					{
						type: 'textinput',
						label: 'MLE',
						id: 'mle',
						default: 'ME:1',
					},
				],
				callback: async (event) => {
					let opt = event.options
					cmd = 'MEAUTO ' + opt.mle
					sendCommand(cmd)
				},
			},

			xpt: {
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
							'Aux Bus — AUX:(aux-number), Black — BK, Clean — ME:(ME-number):CLN, Input Source — IN:(input-number), Key — ME:(ME-number):KEY:(key-number), Matte Color — BG, Media-Store — MS:(channel-number), MiniME™ — MME:(ME-number), Preview — ME:(ME-number):PV, Program — ME:(ME-number):PGM, XPression Alpha — XP:(channel-number):A [Graphite only], XPression Video — XP:(channel-number):V [Graphite only], Chroma Key Video — CK:(chroma key number) [UltraChromeHR, or Carbonite Black v14.0 or higher only], Chroma Key Alpha — CKA:(chroma key number) [UltraChromeHR, or Carbonite Black v14.0 or higher only]',
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
			},

			transKey: {
				name: 'Transition Keyer',
				options: [
					{
						type: 'textinput',
						label: 'MLE',
						id: 'mle',
						default: 'ME:1',
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
						label: 'Transition On/Off Air (On & Off options may not be available in all switchers)',
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
			},

			ftb: {
				label: 'Fade to black',
				options: [],
				callback: async (event) => {
					cmd = 'FTB'
					sendCommand(cmd)
				},
			},

			CLFB: {
				name: 'Clear Framebuffer',
				options: [
					{
						type: 'textinput',
						label: 'Framebuffer',
						id: 'fb',
						default: 1,
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var frameBuffer = parseInt(opt.fb) - 1 // Framebuffer is 0 index so framebuffer 1 is actually 0 in rosstalk
					cmd = 'CLFB ' + frameBuffer
					sendCommand(cmd)
				},
			},

			CLFB_layer: {
				name: 'Clear Layer',
				options: [
					{
						type: 'textinput',
						label: 'Framebuffer',
						id: 'fb',
						default: 1,
						regex: Regex.NUMBER,
					},
					{
						type: 'textinput',
						label: 'layer (OPTIONAL)',
						id: 'layer',
						default: '',
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var frameBuffer = parseInt(opt.fb) - 1 // Framebuffer is 0 index so framebuffer 1 is actually 0 in rosstalk
					var layer = opt.layer
					cmd = 'CLFB ' + frameBuffer + ':' + opt.layer
					sendCommand(cmd)
				},
			},

			CLRA: {
				label: 'Clear All Framebuffers',
				options: [],
				callback: async (event) => {
					cmd = 'CLRA'
					sendCommand(cmd)
				},
			},

			DOWN: {
				label: 'DOWN',
				options: [],
				callback: async (event) => {
					cmd = 'DOWN'
					sendCommand(cmd)
				},
			},

			FOCUS: {
				name: 'FOCUS',
				options: [
					{
						type: 'textinput',
						label: 'Take ID',
						id: 'takeID',
						default: 0,
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var takeID = opt.takeID
					cmd = 'FOCUS ' + takeID
					sendCommand(cmd)
				},
			},

			LAYEROFF: {
				name: 'LAYEROFF',
				options: [
					{
						type: 'textinput',
						label: 'frameBuffer',
						id: 'fb',
						default: 1,
						regex: Regex.NUMBER,
					},
					{
						type: 'textinput',
						label: 'Layer',
						id: 'layer',
						default: 0,
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var layer = opt.layer
					cmd = 'LAYEROFF ' + layer
					sendCommand(cmd)
				},
			},

			MEM: {
				name: 'MEM',
				options: [
					{
						type: 'textinput',
						label: 'Memory ID',
						id: 'memID',
						default: '1:1',
						regex: self.REGEX_STRING,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var memID = opt.memID
					cmd = 'MEM ' + memID
					sendCommand(cmd)
				},
			},

			NEXT: {
				label: 'NEXT',
				options: [],
				callback: async (event) => {
					cmd = 'NEXT'
					sendCommand(cmd)
				},
			},

			READ: {
				label: 'READ',
				options: [],
				callback: async (event) => {
					cmd = 'READ'
					sendCommand(cmd)
				},
			},

			RESUME: {
				name: 'RESUME FRAMEBUFFER',
				options: [
					{
						type: 'textinput',
						label: 'Framebuffer',
						id: 'fb',
						default: 1,
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var frameBuffer = parseInt(opt.fb) - 1
					cmd = 'RESUME ' + frameBuffer
					sendCommand(cmd)
				},
			},

			RESUME_layer: {
				name: 'RESUME LAYER',
				options: [
					{
						type: 'textinput',
						label: 'Framebuffer',
						id: 'fb',
						default: 1,
						regex: Regex.NUMBER,
					},
					{
						type: 'textinput',
						label: 'Layer',
						id: 'layer',
						default: 0,
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var frameBuffer = parseInt(opt.fb) - 1
					var layer = opt.layer
					cmd = 'RESUME ' + frameBuffer + ':' + layer
					sendCommand(cmd)
				},
			},

			SEQI: {
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
			},

			SEQO: {
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
			},

			SWAP: {
				name: 'SWAP',
				options: [
					{
						type: 'textinput',
						label: 'Framebuffer',
						id: 'fb',
						default: 0,
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var frameBuffer = parseInt(opt.fb) - 1
					cmd = 'SWAP ' + frameBuffer
					sendCommand(cmd)
				},
			},

			TAKE: {
				name: 'TAKE',
				options: [
					{
						type: 'textinput',
						label: 'Take ID',
						id: 'takeID',
						default: 0,
						regex: Regex.NUMBER,
					},
					{
						type: 'textinput',
						label: 'Framebuffer',
						id: 'fb',
						default: 0,
						regex: Regex.NUMBER,
					},
					{
						type: 'textinput',
						label: 'Layer',
						id: 'layer',
						default: 0,
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var takeID = opt.takeID
					var frameBuffer = parseInt(opt.fb) - 1
					var layer = opt.layer
					cmd = 'TAKE ' + takeID + ':' + frameBuffer + ':' + layer
					sendCommand(cmd)
				},
			},

			UP: {
				label: 'UP',
				options: [],
				callback: async (event) => {
					cmd = 'UP'
					sendCommand(cmd)
				},
			},

			UPNEXT: {
				name: 'UPNEXT',
				options: [
					{
						type: 'textinput',
						label: 'Take ID',
						id: 'takeID',
						default: 0,
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var takeID = opt.takeID
					cmd = 'UPNEXT ' + takeID
					sendCommand(cmd)
				},
			},

			TIMER: {
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
			},
		}

		this.setActionDefinitions(actions)
	},
}
