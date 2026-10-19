import { Regex } from '@companion-module/base'
import { MLE_CHOICES, VIDEO_DESTINATION_CHOICES, VIDEO_SOURCE_CHOICES } from '../choices.js'
import {
	autoTransitionCommand,
	chromaKeyInitCommand,
	clipLoadCommand,
	clipTransportCommand,
	cutCommand,
	exportRpmSetCommand,
	keyModeCommand,
	loadSetCommand,
	mediaStoreCommand,
	memoryCommand,
	memorySaveCommand,
	multiviewerBoxCommand,
	saveSetCommand,
	sequenceInCommand,
	sequenceOutCommand,
	sequencerFocusCommand,
	sequencerStepCommand,
	type ClipTransport,
	type KeyMode,
	type MultiviewerType,
	type SequencerStep,
	type Ultra60Drive,
} from '../commands.js'
import { dropdownField, mleField, numberField, RE_ME_SOURCE, textField, ULTRA_60_DRIVES, videoField } from './fields.js'
import type { ModelActions } from './index.js'
import type { SharedActions } from './shared.js'

// Bank and memory are one digit each, e.g. 19 is bank 1 memory 9
const RE_MEMORY = '/^[0-9]{2}(:(ME|MME|MSC):([0-9]{1,2}|P\\/P))+$/'

const setDriveField = dropdownField<'drive', Ultra60Drive | ''>('drive', 'Drive (Ultra 60 only)', '', [
	{ id: '', label: 'Default' },
	...ULTRA_60_DRIVES,
])

export function CarboniteActions(shared: SharedActions): ModelActions {
	const { send } = shared

	return {
		cc: shared.customControl(),
		loadset: {
			name: 'Load Set',
			options: [textField('set', 'Set name', 'set1', {}), setDriveField],
			callback: (event) => send(loadSetCommand(event.options.set, event.options.drive || null)),
		},
		saveset: {
			name: 'Save Set',
			options: [textField('set', 'Set name', 'set1', {}), setDriveField],
			callback: (event) => send(saveSetCommand(event.options.set, event.options.drive || null)),
		},
		exportRpmSet: {
			name: 'Export working set to USB',
			options: [textField('name', 'Set name', 'myset', {})],
			callback: (event) => send(exportRpmSetCommand(event.options.name)),
		},
		cut: shared.mleAction('Cut', cutCommand, MLE_CHOICES, RE_ME_SOURCE),
		autotrans: shared.mleAction('Auto Transition', autoTransitionCommand, MLE_CHOICES, RE_ME_SOURCE),
		transRate: shared.transitionRate(MLE_CHOICES, RE_ME_SOURCE),
		transType: shared.transitionType(MLE_CHOICES, RE_ME_SOURCE),
		transIncl: shared.transitionInclude(MLE_CHOICES, RE_ME_SOURCE),
		xpt: shared.crosspoint(VIDEO_DESTINATION_CHOICES, VIDEO_SOURCE_CHOICES),
		transKey: shared.keyTransition(true, MLE_CHOICES, RE_ME_SOURCE),
		keyMode: {
			name: 'Key mode',
			options: [
				mleField(MLE_CHOICES, RE_ME_SOURCE),
				numberField('key', 'Keyer', 1, 1),
				dropdownField<'mode', KeyMode>('mode', 'Mode', 'NORMAL', [
					{ id: 'NORMAL', label: 'Normal (shaped/unshaped from key setup)' },
					{ id: 'ADDITIVE', label: 'Additive' },
					{ id: 'FULL', label: 'Full' },
				]),
			],
			callback: (event) => send(keyModeCommand(event.options.mle, event.options.key, event.options.mode)),
		},
		ckInit: {
			name: 'Initialize chroma key',
			options: [numberField('chromaKey', 'Chroma key engine', 1, 1)],
			callback: (event) => send(chromaKeyInitCommand(event.options.chromaKey)),
		},
		ftb: shared.fadeToBlack(undefined),
		MEM: shared.memory(
			'MEM',
			memoryCommand,
			'11:ME:1',
			'Bank and memory followed by one or more MEs, e.g. 19:ME:2:MME:1 recalls bank 1 memory 9 on ME 2 and MiniME 1',
			RE_MEMORY,
		),
		memSave: shared.memory(
			'Save memory (MEMSAVE)',
			memorySaveCommand,
			'11:ME:1',
			'Bank and memory followed by one or more MEs, e.g. 19:ME:2:MME:1 stores bank 1 memory 9 on ME 2 and MiniME 1',
			RE_MEMORY,
		),
		SEQI: {
			name: 'Load sequence (SEQI)',
			options: [numberField('takeID', 'Sequencer', 1, 0), numberField('Layer', 'Sequence', 1, 0)],
			callback: (event) => send(sequenceInCommand(event.options.takeID, event.options.Layer)),
		},
		SEQO: {
			name: 'Unload sequence (SEQO)',
			options: [numberField('takeID', 'Sequencer', 1, 0)],
			callback: (event) => send(sequenceOutCommand(event.options.takeID)),
		},
		seqStep: {
			name: 'Sequencer: next / up / down',
			description: 'NEXT runs the selected event and advances; UP and DOWN move the selection',
			options: [
				dropdownField<'step', SequencerStep>('step', 'Step', 'NEXT', [
					{ id: 'NEXT', label: 'Run next event' },
					{ id: 'UP', label: 'Move selection up' },
					{ id: 'DOWN', label: 'Move selection down' },
				]),
				numberField('sequencer', 'Sequencer', 1, 1),
			],
			callback: (event) => send(sequencerStepCommand(event.options.step, event.options.sequencer)),
		},
		seqFocus: {
			name: 'Sequencer: select event (FOCUS)',
			options: [numberField('sequencer', 'Sequencer', 1, 1), numberField('event', 'Event', 1, 1)],
			callback: (event) => send(sequencerFocusCommand(event.options.sequencer, event.options.event)),
		},
		MVBOX: {
			name: 'Change multiviewer box',
			options: [
				dropdownField<'mvType', MultiviewerType>('mvType', 'MultiViewer', 'VP', [
					{ id: 'VP', label: 'Video Processor' },
					{ id: 'IO', label: 'I/O' },
				]),
				numberField('mvID', 'Multiviewer Number', 1, 1),
				numberField('boxID', 'Box Number', 1, 1),
				videoField('vidSource', 'Source', 'IN:5', VIDEO_SOURCE_CHOICES),
				{ type: 'checkbox', id: 'shift', label: 'Shifted box', default: false },
			],
			callback: (event) =>
				send(
					multiviewerBoxCommand(
						event.options.mvType ?? 'VP',
						event.options.mvID,
						event.options.boxID,
						event.options.vidSource,
						event.options.shift ?? false,
					),
				),
		},
		clipLoad: {
			name: 'Clip player: load clip',
			options: [textField('name', 'Clip name', '', {})],
			callback: (event) => {
				if (event.options.name) send(clipLoadCommand(event.options.name))
			},
		},
		clipTransport: {
			name: 'Clip player: control',
			options: [
				dropdownField<'transport', ClipTransport>('transport', 'Action', 'PLAY', [
					{ id: 'PLAY', label: 'Play' },
					{ id: 'PAUSE', label: 'Pause' },
					{ id: 'EJECT', label: 'Eject' },
					{ id: 'LOOPON', label: 'Loop on' },
					{ id: 'LOOPOFF', label: 'Loop off' },
				]),
			],
			callback: (event) => send(clipTransportCommand(event.options.transport)),
		},
		mediaStore: {
			name: 'Media-Store: load media',
			description: 'On Mosaic, Media-Store channels are numbered 101-136',
			options: [
				numberField('channel', 'Channel', 1, 1),
				dropdownField('drive', 'Drive', '0', ULTRA_60_DRIVES),
				textField('mediaId', 'Media ID', '001', { regex: Regex.NUMBER }),
			],
			callback: (event) => send(mediaStoreCommand(event.options.channel, event.options.drive, event.options.mediaId)),
		},
		mnem: shared.mnemonic(VIDEO_SOURCE_CHOICES),
	}
}
