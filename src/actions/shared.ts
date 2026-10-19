import type { DropdownChoice } from '@companion-module/base'
import {
	crosspointCommand,
	customControlCommand,
	fadeToBlackCommand,
	keyTransitionCommand,
	mnemonicCommand,
	transitionIncludeCommand,
	transitionRateCommand,
	transitionTypeCommand,
} from '../commands.js'
import type RossTalkInstance from '../main.js'
import {
	dropdownField,
	mleField,
	numberField,
	textField,
	TRANSITION_TYPES,
	transitionDirectionField,
	transitionTypeField,
	videoField,
} from './fields.js'
import type { Definition } from './index.js'

/** Action definitions whose shape is shared between models, differing only in addressing */
export class SharedActions {
	constructor(private readonly self: RossTalkInstance) {}

	readonly send = (cmd: string): void => this.self.sendCommand(cmd)

	customControl(): Definition<'cc'> {
		return {
			name: 'Fire custom control',
			options: [numberField('bank', 'CC Bank', 1, 1), numberField('cc', 'CC Number', 1, 1)],
			callback: (event) => this.send(customControlCommand(event.options.bank, event.options.cc)),
		}
	}

	crosspoint(destinations: DropdownChoice<string>[], sources: DropdownChoice<string>[]): Definition<'xpt'> {
		return {
			name: 'XPT',
			options: [
				videoField('vidDest', 'Destination', String(destinations[0].id), destinations),
				videoField('vidSource', 'Source', 'IN:20', sources),
			],
			callback: (event) => this.send(crosspointCommand(event.options.vidDest, event.options.vidSource)),
		}
	}

	fadeToBlack(description: string | undefined): Definition<'ftb'> {
		return {
			name: 'Fade to black',
			description,
			options: [],
			callback: () => this.send(fadeToBlackCommand()),
		}
	}

	mleAction(
		name: string,
		build: (mle: string) => string,
		choices: DropdownChoice<string>[],
		regex: string | undefined,
	): Definition<'cut'> {
		return {
			name,
			options: [mleField(choices, regex)],
			callback: (event) => this.send(build(event.options.mle)),
		}
	}

	keyTransition(withDirection: boolean, choices: DropdownChoice<string>[], regex: string): Definition<'transKey'> {
		return {
			name: 'Transition Keyer',
			options: [
				mleField(choices, regex),
				numberField('key', 'Keyer', 1, 1),
				...(withDirection ? [transitionDirectionField] : []),
				transitionTypeField,
			],
			callback: (event) =>
				this.send(
					keyTransitionCommand(
						event.options.transT,
						event.options.transD ?? 'TOGGLE',
						event.options.mle ?? '',
						event.options.key,
					),
				),
		}
	}

	memory(
		name: string,
		build: (memId: string) => string,
		defaultMemId: string,
		tooltip: string,
		regex: string,
	): Definition<'MEM'> {
		return {
			name,
			options: [textField('memID', 'Memory ID', defaultMemId, { regex, tooltip })],
			callback: (event) => this.send(build(event.options.memID)),
		}
	}

	transitionRate(choices: DropdownChoice<string>[], regex: string): Definition<'transRate'> {
		return {
			name: 'Transition rate',
			options: [mleField(choices, regex), numberField('rate', 'Rate (frames)', 30, 0)],
			callback: (event) => this.send(transitionRateCommand(event.options.mle, event.options.rate)),
		}
	}

	transitionType(choices: DropdownChoice<string>[], regex: string): Definition<'transType'> {
		return {
			name: 'Transition type',
			options: [mleField(choices, regex), dropdownField('type', 'Type', 'DISS', TRANSITION_TYPES)],
			callback: (event) => this.send(transitionTypeCommand(event.options.mle, event.options.type)),
		}
	}

	transitionInclude(choices: DropdownChoice<string>[], regex: string): Definition<'transIncl'> {
		return {
			name: 'Next transition elements',
			description: 'Replaces the current selection in the next transition area',
			options: [
				mleField(choices, regex),
				{ type: 'checkbox', id: 'background', label: 'Background', default: true },
				{
					type: 'multidropdown',
					id: 'keys',
					label: 'Keys',
					default: [],
					disableAutoExpression: true,
					choices: [1, 2, 3, 4, 5, 6].map((key) => ({ id: key, label: `Key ${key}` })),
				},
			],
			callback: (event) => {
				const cmd = transitionIncludeCommand(event.options.mle, event.options.background, event.options.keys)
				if (cmd) this.send(cmd)
				else this.self.log('warn', 'Next transition elements: nothing selected, command not sent')
			},
		}
	}

	mnemonic(sources: DropdownChoice<string>[]): Definition<'mnem'> {
		return {
			name: 'Set source name (MNEM)',
			options: [videoField('source', 'Source', 'IN:1', sources), textField('name', 'New name', '', {})],
			callback: (event) => {
				if (event.options.name) this.send(mnemonicCommand(event.options.source, event.options.name))
			},
		}
	}
}
