import type {
	CompanionButtonStyleProps,
	CompanionPresetAction,
	CompanionPresetDefinitions,
	CompanionPresetSection,
} from '@companion-module/base'
import type { TimerAction } from './commands.js'
import type { Model } from './config.js'
import type { RossTalkTypes } from './main.js'

type Presets = CompanionPresetDefinitions<RossTalkTypes>
type Section = CompanionPresetSection<RossTalkTypes>
type PresetAction = CompanionPresetAction<RossTalkTypes['actions']>

const WHITE = 0xffffff
const BLACK = 0x000000
const RED = 0xcc0000
const DARK_GREY = 0x333333

const KEYERS = [1, 2, 3, 4]
const INPUTS = [1, 2, 3, 4, 5, 6, 7, 8]
const GPIS = [1, 2, 3, 4, 5, 6, 7, 8]
const TIMER_ACTIONS: TimerAction[] = ['RUN', 'PAUSE', 'STOP', 'END']

function style(text: string, bgcolor: number): CompanionButtonStyleProps {
	return { text, size: 'auto', color: WHITE, bgcolor }
}

function addPreset(presets: Presets, id: string, name: string, text: string, bgcolor: number, action: PresetAction) {
	presets[id] = {
		type: 'simple',
		name,
		style: style(text, bgcolor),
		steps: [{ down: [action], up: [] }],
		feedbacks: [],
	}
	return id
}

export function GetPresets(model: Model): { structure: Section[]; presets: Presets } {
	const presets: Presets = {}
	const structure: Section[] = []

	const gpiLabel = model === 'ultrix' ? 'Salvo' : 'GPI'
	const gpis = GPIS.map((gpi) =>
		addPreset(presets, `gpi_${gpi}`, `${gpiLabel} ${gpi}`, `${gpiLabel.toUpperCase()}\n${gpi}`, DARK_GREY, {
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
				addPreset(presets, 'cut', 'Cut ME 1', 'CUT', RED, { actionId: 'cut', options: { mle } }),
				addPreset(presets, 'auto', 'Auto transition ME 1', 'AUTO', RED, {
					actionId: 'autotrans',
					options: { mle },
				}),
				addPreset(presets, 'ftb', 'Fade to black', 'FTB', BLACK, { actionId: 'ftb', options: {} }),
			],
		})

		const preview = INPUTS.map((input) =>
			addPreset(presets, `xpt_pv_${input}`, `ME 1 preset: input ${input}`, `PST\nIN ${input}`, DARK_GREY, {
				actionId: 'xpt',
				options: { vidDest: `${me1}:PST`, vidSource: `IN:${input}` },
			}),
		)
		const program = INPUTS.map((input) =>
			addPreset(presets, `xpt_pgm_${input}`, `ME 1 program: input ${input}`, `PGM\nIN ${input}`, RED, {
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
			definitions: [addPreset(presets, 'ftb', 'Fade to black', 'FTB', BLACK, { actionId: 'ftb', options: {} })],
		})
	}

	if (model !== 'ultrix') {
		const keyers = KEYERS.flatMap((key) =>
			(['AUTO', 'CUT'] as const).map((transT) =>
				addPreset(
					presets,
					`key_${transT}_${key}`,
					`Keyer ${key} ${transT.toLowerCase()}`,
					`KEY ${key}\n${transT}`,
					DARK_GREY,
					{
						actionId: 'transKey',
						options: {
							key,
							transT,
							// openGear keyers have no MLE or direction
							...(model === 'opengear' ? {} : { mle: model === 'carbonite' ? 'ME:1' : '1', transD: 'TOGGLE' as const }),
						},
					},
				),
			),
		)
		structure.push({ id: 'keyers', name: 'Keyers', description: 'Keyers on ME 1', definitions: keyers })
	}

	if (model === 'ultrix') {
		const timers = TIMER_ACTIONS.map((timerAction) =>
			addPreset(
				presets,
				`timer_${timerAction}`,
				`Timer 1 ${timerAction.toLowerCase()}`,
				`TIMER\n${timerAction}`,
				DARK_GREY,
				{
					actionId: 'TIMER',
					options: { timerAction, timerID: 1 },
				},
			),
		)
		structure.push({ id: 'timers', name: 'Timers', definitions: timers })
	}

	return { structure, presets }
}
