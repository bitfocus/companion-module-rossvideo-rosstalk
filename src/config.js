const { Regex } = require('@companion-module/base')
module.exports = {
	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value:
					'To make sense of the input and output names available in the actions provided by this module, you might want to read the bottom of <a href="http://help.rossvideo.com/carbonite-device/Topics/Protocol/RossTalk/CNT/RT-CNT-Comm.html" target="_new">this reference manual</a>.',
			},
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Model',
				value:
					'This module does not support Xpression, instead use the dedicated module: <a href="https://github.com/bitfocus/companion-module-rossvideo-xpression">companion-module-rossvideo-xpression</a>',
			},
			{
				type: 'dropdown',
				id: 'model',
				label: 'Model',
				width: 12,
				default: 'carbonite',
				choices: [
					{ id: 'carbonite', label: 'Carbonite/Graphite' },
					{ id: 'ultrix', label: 'Ultrix' },
					{ id: 'acuity', label: 'Acuity/Vision' },
				],
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Switcher Frame IP',
				width: 6,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Switcher Frame Port',
				width: 6,
				default: '7788',
				regex: Regex.PORT,
			},
			{
				type: 'checkbox',
				id: 'keepAlive',
				label: 'TCP Keep Alive',
				tooltip: 'TCP Keep Alive: Use a single TCP connection instead of one per command',
				width: 6,
				default: false,
			},
		]
	},
}
