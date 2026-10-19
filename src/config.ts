import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export type Model = 'carbonite' | 'ultrix' | 'acuity' | 'opengear'

export const DEFAULT_PORT = 7788

export type ModuleConfig = {
	model: Model
	host: string
	port: number
	keepAlive: boolean
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
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
				{ id: 'opengear', label: 'openGear' },
			],
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Switcher Frame IP / Hostname',
			width: 6,
			regex: Regex.HOSTNAME,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Switcher Frame Port',
			width: 6,
			default: DEFAULT_PORT,
			min: 1,
			max: 65535,
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
}
