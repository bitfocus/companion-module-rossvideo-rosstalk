import { logoLoadCommand, openGearKeyTransitionCommand, effectArmCommand, effectStateCommand } from '../commands.js'
import { numberField, textField, transitionTypeField } from './fields.js'
import type { ModelActions } from './index.js'
import type { SharedActions } from './shared.js'

export function OpenGearActions(shared: SharedActions): ModelActions {
	const { send } = shared

	return {
		ftb: shared.fadeToBlack('Not supported on the MDK-111A-K.'),
		transKey: {
			name: 'Transition Keyer',
			options: [numberField('key', 'Keyer', 1, 1), transitionTypeField],
			callback: (event) => send(openGearKeyTransitionCommand(event.options.transT, event.options.key)),
		},
		logoLoad: {
			name: 'Load logo',
			description: 'Loads a media file from the CompactFlash card into a Logo channel. File names are case sensitive.',
			options: [
				numberField('channel', 'Logo channel', 1, 1),
				textField('file', 'File path', 'Logo/', { tooltip: 'Path on the CompactFlash card, e.g. Logo/Ross_LOGO.png' }),
			],
			callback: (event) => {
				if (event.options.file) send(logoLoadCommand(event.options.channel, event.options.file))
			},
		},
		effectArm: {
			name: 'Arm effect on preset',
			options: [
				numberField('effect', 'Effect number', 1, 1),
				{ type: 'checkbox', id: 'armed', label: 'Armed', default: true },
			],
			callback: (event) => send(effectArmCommand(event.options.effect, event.options.armed)),
		},
		effectState: {
			name: 'Take effect on / off air',
			options: [
				numberField('effect', 'Effect number', 1, 1),
				{ type: 'checkbox', id: 'onAir', label: 'On air', default: true },
			],
			callback: (event) => send(effectStateCommand(event.options.effect, event.options.onAir)),
		},
	}
}
