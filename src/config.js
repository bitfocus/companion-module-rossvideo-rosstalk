const { Regex } = require('@companion-module/base')
module.exports = {
	getConfigFields() {
		var self = this
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
		]
	},
}
