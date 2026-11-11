import type {
	CompanionButtonStyleProps,
	CompanionPresetAction,
	CompanionPresetDefinitions,
	CompanionPresetSection,
} from '@companion-module/base'
import type { ServerLoopMode, TimerAction } from './commands.js'
import type { Model } from './config.js'
import type { RossTalkTypes } from './main.js'

type Presets = CompanionPresetDefinitions<RossTalkTypes>
type Section = CompanionPresetSection<RossTalkTypes>
type PresetAction = CompanionPresetAction<RossTalkTypes['actions']>

const WHITE = 0xffffff
const BLACK = 0x000000

const KEYERS = [1, 2, 3, 4]
const INPUTS = [1, 2, 3, 4, 5, 6, 7, 8]
const GPIS = [1, 2, 3, 4, 5, 6, 7, 8]
const TIMER_ACTIONS: TimerAction[] = ['RUN', 'PAUSE', 'STOP', 'END']
const SERVER_CHANNELS = ['A', 'B', 'C', 'D']

function style(text: string): CompanionButtonStyleProps {
	return { text, size: 'auto', color: WHITE, bgcolor: BLACK }
}

function addPreset(presets: Presets, id: string, name: string, text: string, action: PresetAction) {
	presets[id] = {
		type: 'simple',
		name,
		style: style(text),
		steps: [{ down: [action], up: [] }],
		feedbacks: [],
	}
	return id
}

export function GetPresets(model: Model): { structure: Section[]; presets: Presets } {
	const presets: Presets = {}
	const structure: Section[] = []

	if (model === 'videoserver') {
		addVideoServerPresets(presets, structure)
		return { structure, presets }
	}

	const gpiLabel = model === 'ultrix' ? 'Salvo' : 'GPI'
	const gpis = GPIS.map((gpi) =>
		addPreset(presets, `gpi_${gpi}`, `${gpiLabel} ${gpi}`, `${gpiLabel.toUpperCase()}\n${gpi}`, {
			actionId: 'gpi',
			options: { gpi },
		}),
	)
	structure.push({ id: 'gpi', name: model === 'ultrix' ? 'Salvos' : 'GPI', definitions: gpis })

	if (model === 'carbonite' || model === 'acuity') {
		const mle = model === 'carbonite' ? 'ME:1' : '1'
		const me1 = model === 'carbonite' ? 'ME:1' : 'MLE:1'
		structure.push({
			id: 'transitions',
			name: 'Transitions',
			definitions: [
				addPreset(presets, 'cut', 'Cut ME 1', 'CUT', { actionId: 'cut', options: { mle } }),
				addPreset(presets, 'auto', 'Auto transition ME 1', 'AUTO', {
					actionId: 'autotrans',
					options: { mle },
				}),
				addPreset(presets, 'ftb', 'Fade to black', 'FTB', { actionId: 'ftb', options: {} }),
			],
		})

		const preview = INPUTS.map((input) =>
			addPreset(presets, `xpt_pv_${input}`, `ME 1 preset: input ${input}`, `PST\nIN ${input}`, {
				actionId: 'xpt',
				options: { vidDest: `${me1}:PST`, vidSource: `IN:${input}` },
			}),
		)
		const program = INPUTS.map((input) =>
			addPreset(presets, `xpt_pgm_${input}`, `ME 1 program: input ${input}`, `PGM\nIN ${input}`, {
				actionId: 'xpt',
				options: { vidDest: `${me1}:PGM`, vidSource: `IN:${input}` },
			}),
		)
		structure.push({
			id: 'crosspoints',
			name: 'Crosspoints',
			definitions: [
				{ id: 'preset', type: 'simple', name: 'ME 1 preset bus', presets: preview },
				{ id: 'program', type: 'simple', name: 'ME 1 program bus', presets: program },
			],
		})
	}

	if (model === 'opengear') {
		structure.push({
			id: 'transitions',
			name: 'Transitions',
			definitions: [addPreset(presets, 'ftb', 'Fade to black', 'FTB', { actionId: 'ftb', options: {} })],
		})
	}

	if (model !== 'ultrix') {
		const keyers = KEYERS.flatMap((key) =>
			(['AUTO', 'CUT'] as const).map((transT) =>
				addPreset(presets, `key_${transT}_${key}`, `Keyer ${key} ${transT.toLowerCase()}`, `KEY ${key}\n${transT}`, {
					actionId: 'transKey',
					options: {
						key,
						transT,
						// openGear keyers have no MLE or direction
						...(model === 'opengear' ? {} : { mle: model === 'carbonite' ? 'ME:1' : '1', transD: 'TOGGLE' as const }),
					},
				}),
			),
		)
		structure.push({ id: 'keyers', name: 'Keyers', description: 'Keyers on ME 1', definitions: keyers })
	}

	if (model === 'ultrix') {
		const timers = TIMER_ACTIONS.map((timerAction) =>
			addPreset(presets, `timer_${timerAction}`, `Timer 1 ${timerAction.toLowerCase()}`, `TIMER\n${timerAction}`, {
				actionId: 'TIMER',
				options: { timerAction, timerID: 1 },
			}),
		)
		structure.push({ id: 'timers', name: 'Timers', definitions: timers })
	}

	return { structure, presets }
}

function addVideoServerPresets(presets: Presets, structure: Section[]): void {
	const loopModes: ServerLoopMode[] = ['off', 'loop']
	for (const channel of SERVER_CHANNELS) {
		structure.push({
			id: `channel_${channel}`,
			name: `Channel ${channel}`,
			definitions: [
				addPreset(presets, `play_${channel}`, `Play channel ${channel}`, `PLAY\n${channel}`, {
					actionId: 'serverPlay',
					options: { channel, clip: '', timecode: '' },
				}),
				addPreset(presets, `stop_${channel}`, `Stop channel ${channel}`, `STOP\n${channel}`, {
					actionId: 'serverStop',
					options: { channel },
				}),
				addPreset(presets, `eject_${channel}`, `Eject channel ${channel}`, `EJECT\n${channel}`, {
					actionId: 'serverEject',
					options: { channel },
				}),
				addPreset(presets, `goto_start_${channel}`, `Go to start of channel ${channel}`, `START\n${channel}`, {
					actionId: 'serverGoto',
					options: { channel, timecode: '00,00,00,00' },
				}),
				...loopModes.map((mode) =>
					addPreset(
						presets,
						`loop_${mode}_${channel}`,
						`Channel ${channel} loop ${mode}`,
						`LOOP ${mode.toUpperCase()}\n${channel}`,
						{
							actionId: 'serverLoop',
							options: { channel, mode },
						},
					),
				),
			],
		})
	}
}
