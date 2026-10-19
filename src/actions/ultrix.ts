import { routerCrosspointCommand, timerCommand, type TimerAction } from '../commands.js'
import { expressionDropdownField, numberField, textField } from './fields.js'
import type { ModelActions } from './index.js'
import type { SharedActions } from './shared.js'

const RE_LEVELS = '/^$|^[0-9]+(-[0-9]+)?(,[0-9]+(-[0-9]+)?)*$/'

export function UltrixActions(shared: SharedActions): ModelActions {
	const { send } = shared

	return {
		TIMER: {
			name: 'Ultrix Timer',
			options: [
				expressionDropdownField<'timerAction', TimerAction>('timerAction', 'Action type', 'RUN', [
					{ id: 'RUN', label: 'Run Timer' },
					{ id: 'PAUSE', label: 'Pause Timer' },
					{ id: 'STOP', label: 'Stop Timer' },
					{ id: 'END', label: 'End Timer' },
				]),
				numberField('timerID', 'Timer Number', 1, 0),
			],
			callback: (event) => send(timerCommand(event.options.timerID, event.options.timerAction)),
		},
		routerXpt: {
			name: 'Router crosspoint',
			description: 'Requests a source on a destination, on behalf of a user or panel ID',
			options: [
				textField('destination', 'Destination', '1', {}),
				textField('source', 'Source', '1', {}),
				numberField('userId', 'User / panel ID', 1, 0),
				textField('levels', 'Levels', '', {
					regex: RE_LEVELS,
					tooltip: 'Optional. Comma separated levels and ranges, e.g. 1,6,10-13. Leave empty for all levels.',
				}),
			],
			callback: (event) =>
				send(
					routerCrosspointCommand(
						event.options.destination,
						event.options.source,
						event.options.userId,
						event.options.levels,
					),
				),
		},
	}
}
