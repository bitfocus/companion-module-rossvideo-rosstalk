import { Regex } from '@companion-module/base'
import { ACUITY_VIDEO_DESTINATION_CHOICES, ACUITY_VIDEO_SOURCE_CHOICES, MLE_NUMBER_CHOICES } from '../choices.js'
import {
	acuityMediaStoreCommand,
	acuitySaveSetCommand,
	autoTransitionCommand,
	captureMeCommand,
	captureToMediaStoreCommand,
	cueClipCommand,
	cutCommand,
	gpiOutputCommand,
	keyShapedCommand,
	loadSetCommand,
	mediaStorePlayCommand,
	memoryCommand,
	memorySaveCommand,
	multiviewerBoxCommand,
	resetAllCommand,
	setVideoModeCommand,
	userVariableCommand,
	videoServerCommand,
	type CaptureMode,
	type UserVariableOperation,
	type VideoModeTarget,
	type VideoServerCommand,
} from '../commands.js'
import { ACUITY_LOCATIONS, dropdownField, mleField, numberField, onOffField, textField, videoField } from './fields.js'
import type { ModelActions } from './index.js'
import type { SharedActions } from './shared.js'

// Bank and memory are one digit each, e.g. 19 is bank 1 memory 9
const RE_MEMORY = '/^[0-9]{2}(:[0-9]{1,2})+$/'

/** Global-Store, Global-Store Audio, or an ME number for that ME's ME-Store */
const MEDIA_STORE_CHOICES = [
	{ id: 'GS', label: 'Global-Store (GS)' },
	{ id: 'GSA', label: 'Global-Store Audio (GSA)' },
	...MLE_NUMBER_CHOICES.map((me) => ({ id: me.id, label: `ME-Store on ${me.label}` })),
]

const VIDEO_FORMATS = [
	'1080i59.94',
	'1080i50',
	'1080p59.94',
	'1080p50',
	'720p59.94',
	'720p50',
	'480i',
	'480i 16x9',
	'576i',
]

export function AcuityActions(shared: SharedActions, model: 'acuity'): ModelActions {
	const { send } = shared

	return {
		gpiOutput: {
			name: 'Set GPI output',
			options: [numberField('gpi', 'GPI', 1, 0), onOffField('state', 'State')],
			callback: (event) => send(gpiOutputCommand(model, event.options.gpi, event.options.state)),
		},
		cc: shared.customControl(),
		loadset: {
			name: 'Load Set',
			options: [
				dropdownField('location', 'Load Location', 'USB', ACUITY_LOCATIONS),
				textField('set', 'Set name', 'set1', {}),
			],
			callback: (event) => send(loadSetCommand(event.options.set, event.options.location ?? 'USB')),
		},
		saveset: {
			name: 'Save Set',
			options: [
				dropdownField('location', 'Save Location', 'USB', ACUITY_LOCATIONS),
				numberField('setup', 'Setup number', 0, 0),
				textField('set', 'Set name', 'set1', {}),
			],
			description: 'With setup number 0, the switcher matches the set name and overwrites it',
			callback: (event) =>
				send(acuitySaveSetCommand(event.options.location ?? 'USB', event.options.setup || null, event.options.set)),
		},
		cut: shared.mleAction('Cut', cutCommand, MLE_NUMBER_CHOICES, Regex.NUMBER),
		autotrans: shared.mleAction('Auto Transition', autoTransitionCommand, MLE_NUMBER_CHOICES, Regex.NUMBER),
		transRate: shared.transitionRate(MLE_NUMBER_CHOICES, Regex.NUMBER),
		transType: shared.transitionType(MLE_NUMBER_CHOICES, Regex.NUMBER),
		transIncl: shared.transitionInclude(MLE_NUMBER_CHOICES, Regex.NUMBER),
		xpt: shared.crosspoint(ACUITY_VIDEO_DESTINATION_CHOICES, ACUITY_VIDEO_SOURCE_CHOICES),
		// Acuity addresses keyers as `ME:keyer` with a bare ME number, e.g. KEYAUTO 1:4
		transKey: shared.keyTransition(true, MLE_NUMBER_CHOICES, Regex.NUMBER),
		keyShaped: {
			name: 'Shaped key',
			options: [
				mleField(MLE_NUMBER_CHOICES, Regex.NUMBER),
				numberField('key', 'Keyer', 1, 1),
				onOffField('state', 'Shaped'),
			],
			callback: (event) => send(keyShapedCommand(event.options.mle, event.options.key, event.options.state)),
		},
		ftb: shared.fadeToBlack(undefined),
		MEM: shared.memory(
			'MEM',
			memoryCommand,
			'11:1',
			'Bank and memory followed by one or more ME numbers, e.g. 19:2:1 recalls bank 1 memory 9 on ME 2 and ME 1',
			RE_MEMORY,
		),
		memSave: shared.memory(
			'Save memory (MEMSAVE)',
			memorySaveCommand,
			'11:1',
			'Bank and memory followed by one or more ME numbers, e.g. 23:1:2:4 stores bank 2 memory 3 on ME 1, 2 and 4',
			RE_MEMORY,
		),
		MVBOX: {
			name: 'Change multiviewer box',
			options: [
				numberField('mvID', 'Multiviewer Number', 1, 1),
				numberField('boxID', 'Box Number', 1, 1),
				videoField('vidSource', 'Source', 'IN:5', ACUITY_VIDEO_SOURCE_CHOICES),
			],
			callback: (event) =>
				send(multiviewerBoxCommand(null, event.options.mvID, event.options.boxID, event.options.vidSource, false)),
		},
		acuityMediaStore: {
			name: 'Media-Store: load media',
			options: [
				videoField('store', 'Store', 'GS', MEDIA_STORE_CHOICES),
				numberField('channel', 'Channel', 1, 1),
				numberField('mediaId', 'Media ID', 1, 0),
			],
			callback: (event) =>
				send(acuityMediaStoreCommand(event.options.store, event.options.channel, event.options.mediaId)),
		},
		msPlay: {
			name: 'Media-Store: play',
			options: [videoField('store', 'Store', 'GS', MEDIA_STORE_CHOICES), numberField('channel', 'Channel', 1, 1)],
			callback: (event) => send(mediaStorePlayCommand(event.options.store, event.options.channel)),
		},
		captureMediaStore: {
			name: 'Capture to Media-Store',
			description: 'Acuity only',
			options: [
				dropdownField<'mode', CaptureMode>('mode', 'Capture to', 'RAM', [
					{ id: 'RAM', label: 'RAM' },
					{ id: 'DISK', label: 'Disk' },
				]),
				numberField('channel', 'Media-Store channel', 1, 1),
				videoField('source', 'Source', 'IN:1', ACUITY_VIDEO_SOURCE_CHOICES),
				numberField('frames', 'Duration (frames)', 1, 1),
			],
			callback: (event) =>
				send(
					captureToMediaStoreCommand(
						event.options.mode,
						event.options.channel,
						event.options.source,
						event.options.frames,
					),
				),
		},
		captureMe: {
			name: 'Capture ME source',
			description: 'Ultrix Acuity only',
			options: [
				numberField('me', 'ME', 1, 1),
				textField('source', 'ME source', 'PGMA', { tooltip: 'e.g. PGMC for Program C' }),
				numberField('channel', 'Media-Store channel', 1, 1),
			],
			callback: (event) => send(captureMeCommand(event.options.me, event.options.source, event.options.channel)),
		},
		videoServer: {
			name: 'Video server: play / pause / eject',
			description: 'Sends a VTR/VDCP command to the server channel assigned to the source',
			options: [
				dropdownField<'command', VideoServerCommand>('command', 'Command', 'PLAY', [
					{ id: 'PLAY', label: 'Play' },
					{ id: 'PAUSE', label: 'Pause' },
					{ id: 'EJECT', label: 'Eject' },
				]),
				videoField('source', 'Source', 'IN:1', ACUITY_VIDEO_SOURCE_CHOICES),
			],
			callback: (event) => send(videoServerCommand(event.options.command, event.options.source)),
		},
		cueClip: {
			name: 'Video server: cue clip',
			options: [
				videoField('source', 'Source', 'IN:1', ACUITY_VIDEO_SOURCE_CHOICES),
				textField('clip', 'Clip name', '', {}),
			],
			callback: (event) => {
				if (event.options.clip) send(cueClipCommand(event.options.source, event.options.clip))
			},
		},
		mnem: shared.mnemonic(ACUITY_VIDEO_SOURCE_CHOICES),
		userVar: {
			name: 'User variable',
			options: [
				textField('name', 'Variable name', 'A', {}),
				dropdownField<'operation', UserVariableOperation>('operation', 'Operation', '=', [
					{ id: '=', label: 'Set to' },
					{ id: '+', label: 'Add' },
					{ id: '-', label: 'Subtract' },
					{ id: '*', label: 'Multiply by' },
					{ id: '/', label: 'Divide by' },
				]),
				{ ...numberField('value', 'Value', 0, -999999), max: 999999 },
			],
			callback: (event) => {
				if (event.options.name)
					send(userVariableCommand(event.options.name, event.options.operation, event.options.value))
			},
		},
		setVidMode: {
			name: 'Set video mode (disruptive)',
			description: 'Changes the reference or operating video format of the switcher. This interrupts output.',
			options: [
				dropdownField<'target', VideoModeTarget>('target', 'Set', 'VID', [
					{ id: 'VID', label: 'Operating video format' },
					{ id: 'REF', label: 'Input reference format' },
				]),
				videoField(
					'format',
					'Format',
					'1080i59.94',
					VIDEO_FORMATS.map((format) => ({ id: format, label: format })),
				),
			],
			callback: (event) => {
				if (event.options.format) send(setVideoModeCommand(event.options.target, event.options.format))
			},
		},
		resetAll: {
			name: 'Reset switcher (disruptive)',
			description: 'Performs an ALL+ALL soft reset of the switcher',
			options: [],
			callback: () => send(resetAllCommand()),
		},
	}
}
