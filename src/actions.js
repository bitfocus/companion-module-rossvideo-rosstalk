const { Regex } = require('@companion-module/base')
module.exports = {
	actions() {
		let self = this

		const re_meSource_meNumber = '/^(ME|MME|MSC):[0-9]{1,2}$/'

		const sendCommand = (cmd) => {
			if (cmd !== undefined) {
				if (!self.config.keepAlive) {
					self.init_tcp(cmd);
				}
				else if (self.socket !== undefined && self.socket.isConnected) {
					self.log('debug', `sending tcp ${cmd} to ${self.config.host}`)
					self.socket.send(cmd + '\r\n')
				} else {
					self.log('debug', 'Socket not connected :(')
				}
			}
		}

		const parseVariable = async (input) => {
			if (typeof input === 'string' && input.includes('$(')) {
				return await self.parseVariablesInString(input)
			}
			return input
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
						useVariables: true,
					},
				],
				callback: async (event) => {
					let opt = event.options
					let gpiText = await parseVariable(opt.gpi)
					var gpi = parseInt(gpiText)
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
						useVariables: true,
					},
					{
						type: 'textinput',
						label: 'Parameter',
						id: 'parameter',
						useVariables: true,
					},
				],
				callback: async (event) => {
					let opt = event.options

					if (opt.gpi) {
						let gpi = await parseVariable(opt.gpi)
						let parameter = await parseVariable(opt.parameter)
						if (parameter === null) {
							cmd = 'GPI ' + gpi
						} else {
							cmd = 'GPI ' + gpi + ':' + parameter
						}
						sendCommand(cmd)
					}
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
						useVariables: true,
					},
				],
				callback: async (event) => {
					let opt = event.options
					let cmd = await parseVariable(opt.cmd)
					sendCommand(cmd)
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
						useVariables: true,
					},
					{
						type: 'textinput',
						label: 'CC Number',
						id: 'cc',
						default: '1',
						regex: Regex.NUMBER,
						useVariables: true,
					},
				],
				callback: async (event) => {
					let opt = event.options
					let bankText = await parseVariable(opt.bank)
					let ccText = await parseVariable(opt.cc)
					var cc = parseInt(ccText)
					cmd = 'CC ' + parseInt(bankText) + ':' + (cc > 9 ? '' : '0') + cc
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
						useVariables: true,
						default: 'set1',
					},
				],
				callback: async (event) => {
					let opt = event.options
					let set = await parseVariable(opt.set)
					cmd = 'LOADSET ' + set
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
						useVariables: true,
						default: 'ME:1',
						regex: re_meSource_meNumber,
					},
				],
				callback: async (event) => {
					let opt = event.options
					let mle = await parseVariable(opt.mle)
					cmd = 'MECUT ' + mle
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
						useVariables: true,
						default: 'ME:1',
						regex: re_meSource_meNumber,
					},
				],
				callback: async (event) => {
					let opt = event.options
					let mle = await parseVariable(opt.mle)
					cmd = 'MEAUTO ' + mle
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
						useVariables: true,
					},
					{
						type: 'textinput',
						label: 'Source',
						id: 'vidSource',
						default: 'IN:20',
						tooltip:
							'Aux Bus — AUX:(aux-number), Black — BK, Clean — ME:(ME-number):CLN, Input Source — IN:(input-number), Key — ME:(ME-number):KEY:(key-number), Matte Color — BG, Media-Store — MS:(channel-number), MiniME™ — MME:(ME-number), Preview — ME:(ME-number):PV, Program — ME:(ME-number):PGM, [Graphite only], Chroma Key Video — CK:(chroma key number) [UltraChromeHR, or Carbonite Black v14.0 or higher only], Chroma Key Alpha — CKA:(chroma key number) [UltraChromeHR, or Carbonite Black v14.0 or higher only]',
						useVariables: true,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var src = await parseVariable(opt.vidSource)
					var dst = await parseVariable(opt.vidDest)
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
						useVariables: true,
						default: 'ME:1',
						regex: re_meSource_meNumber,
					},
					{
						type: 'textinput',
						label: 'Keyer',
						id: 'key',
						default: 1,
						regex: Regex.NUMBER,
						useVariables: true,
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
					let mle = await parseVariable(opt.mle)
					let keyText = await parseVariable(opt.key)
					if (opt.transD === 'TOGGLE') {
						cmd = 'KEY' + opt.transT + ' ' + mle + ':' + keyText
					} else {
						cmd = 'KEY' + opt.transT + opt.transD + ' ' + mle + ':' + keyText
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
						useVariables: true,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var memID = await parseVariable(opt.memID)
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
						useVariables: true,
					},
					{
						type: 'textinput',
						label: 'Layer',
						id: 'Layer',
						default: 0,
						regex: Regex.NUMBER,
						useVariables: true,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var takeID = await parseVariable(opt.takeID)
					var layer = await parseVariable(opt.Layer)
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
						useVariables: true,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var takeID = await parseVariable(opt.takeID)
					cmd = 'SEQO ' + takeID
					sendCommand(cmd)
				},
			}
			actions.MVBOX = {
				name: "Change multiviewer box",
				options: [
					{
						type: 'textinput',
						label: 'Multiviewer Number',
						id: 'mvID',
						default: 1,
						regex: Regex.NUMBER,
					},
					{
						type: 'textinput',
						label: 'Box Number',
						id: 'boxID',
						default: 1,
						regex: Regex.NUMBER,
					},
					{
						type: 'textinput',
						label: 'Source',
						id: 'vidSource',
						default: 'IN:5',
						tooltip:
							'Aux Bus — AUX:(aux-number), Black — BK, Clean — ME:(ME-number):CLN, Input Source — IN:(input-number), Key — ME:(ME-number):KEY:(key-number), Matte Color — BG, Media-Store — MS:(channel-number), MiniME™ — MME:(ME-number), Preview — ME:(ME-number):PV, Program — ME:(ME-number):PGM, [Graphite only], Chroma Key Video — CK:(chroma key number) [UltraChromeHR, or Carbonite Black v14.0 or higher only], Chroma Key Alpha — CKA:(chroma key number) [UltraChromeHR, or Carbonite Black v14.0 or higher only]',
						useVariables: true
					}
				],
				callback: async (event) => {
					let opt = event.options
					let mvID = parseInt(opt.mvID)
					let boxID = parseInt(opt.boxID)
					var src = await parseVariable(opt.vidSource)

					cmd = 'MVBOX:' + mvID + ":" + boxID + ":" + src
					sendCommand(cmd)
				}
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
						useVariables: true,
					},
					{
						type: 'textinput',
						label: 'CC Number',
						id: 'cc',
						default: '1',
						regex: Regex.NUMBER,
						useVariables: true,
					},
				],
				callback: async (event) => {
					let opt = event.options
					let bankText = await parseVariable(opt.bank)
					let ccText = await parseVariable(opt.cc)
					var cc = parseInt(ccText)
					cmd = 'CC ' + parseInt(bankText) + ':' + (cc > 9 ? '' : '0') + cc
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
						useVariables: true,
						regex: re_meSource_meNumber,
					},
					{
						type: 'textinput',
						label: 'Keyer',
						id: 'key',
						default: 1,
						regex: Regex.NUMBER,
						useVariables: true,
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
					let mle = await parseVariable(opt.mle)
					let keyText = await parseVariable(opt.key)
					cmd = 'KEY' + opt.transT + ' ' + mle + ':' + keyText
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
						useVariables: true,
						id: 'set',
						default: 'set1',
					},
				],
				callback: async (event) => {
					let opt = event.options
					let set = await parseVariable(opt.set)
					let location = await parseVariable(opt.location)
					cmd = 'LOADSET ' + location + ':' + set
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
						useVariables: true,
						default: '1',
					},
				],
				callback: async (event) => {
					let opt = event.options
					let mle = await parseVariable(opt.mle)
					cmd = 'MECUT ' + mle
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
						useVariables: true,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var memID = await parseVariable(opt.memID)
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
						useVariables: true,
						default: '1',
						regex: Regex.NUMBER,
					},
				],
				callback: async (event) => {
					let opt = event.options
					let mle = await parseVariable(opt.mle)
					cmd = 'MEAUTO ' + mle
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
						useVariables: true,
					},
					{
						type: 'textinput',
						label: 'Source',
						id: 'vidSource',
						default: 'IN:20',
						tooltip:
							'Aux Bus — AUX:(aux-number), Black — BK, Clean — ME:(ME-number):CLN, Input Source — IN:(input-number), Key — ME:(ME-number):KEY:(key-number), Matte Color — BG, Media-Store — MS:(channel-number), MiniME™ — MME:(ME-number), Preview — ME:(ME-number):PV, Program — ME:(ME-number):PGM, [Graphite only], Chroma Key Video — CK:(chroma key number) [UltraChromeHR, or Carbonite Black v14.0 or higher only], Chroma Key Alpha — CKA:(chroma key number) [UltraChromeHR, or Carbonite Black v14.0 or higher only]',
						useVariables: true,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var src = await parseVariable(opt.vidSource)
					var dst = await parseVariable(opt.vidDest)
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
						useVariables: true,
					},
				],
				callback: async (event) => {
					let opt = event.options
					var timerAction = opt.timerAction
					var timerIDText = await parseVariable(opt.timerID)
					var timerID = parseInt(timerIDText)
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
						useVariables: true,
						default: 'ME:1',
						regex: re_meSource_meNumber,
					},
					{
						type: 'textinput',
						label: 'Keyer',
						id: 'key',
						default: 1,
						regex: Regex.NUMBER,
						useVariables: true,
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
					let mle = await parseVariable(opt.mle)
					let keyText = await parseVariable(opt.key)
					cmd = 'KEY' + opt.transT + ' ' + mle + ':' + keyText
					sendCommand(cmd)
				},
			}
		}

		this.setActionDefinitions(actions)
	},
}
