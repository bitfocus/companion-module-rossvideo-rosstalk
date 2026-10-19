import type { CompanionActionDefinition, CompanionActionDefinitions } from '@companion-module/base'
import {
	gpiByNameCommand,
	gpiCommand,
	type CaptureMode,
	type ClipTransport,
	type KeyMode,
	type KeyTransitionDirection,
	type KeyTransitionType,
	type LoadLocation,
	type MultiviewerType,
	type OnOff,
	type SequencerStep,
	type TimerAction,
	type TransitionType,
	type Ultra60Drive,
	type UserVariableOperation,
	type VideoModeTarget,
	type VideoServerCommand,
} from '../commands.js'
import type { Model } from '../config.js'
import type RossTalkInstance from '../main.js'
import { AcuityActions } from './acuity.js'
import { CarboniteActions } from './carbonite.js'
import { OpenGearActions } from './opengear.js'
import { UltrixActions } from './ultrix.js'
import { numberField, textField } from './fields.js'
import { SharedActions } from './shared.js'

export type RossTalkActions = {
	gpi: { options: { gpi: number } }
	gpiOutput: { options: { gpi: number; state: OnOff } }
	gpiByName: { options: { gpi: string; parameter: string } }
	custom: { options: { cmd: string } }
	cc: { options: { bank: number; cc: number } }
	loadset: { options: { set: string; location?: LoadLocation; drive?: Ultra60Drive | '' } }
	saveset: { options: { set: string; location?: LoadLocation; setup?: number; drive?: Ultra60Drive | '' } }
	exportRpmSet: { options: { name: string } }
	cut: { options: { mle: string } }
	autotrans: { options: { mle: string } }
	transRate: { options: { mle: string; rate: number } }
	transType: { options: { mle: string; type: TransitionType } }
	transIncl: { options: { mle: string; background: boolean; keys: number[] } }
	xpt: { options: { vidDest: string; vidSource: string } }
	transKey: {
		options: { mle?: string; key: number; transT: KeyTransitionType; transD?: KeyTransitionDirection }
	}
	keyMode: { options: { mle: string; key: number; mode: KeyMode } }
	keyShaped: { options: { mle: string; key: number; state: OnOff } }
	ckInit: { options: { chromaKey: number } }
	ftb: { options: Record<string, never> }
	MEM: { options: { memID: string } }
	memSave: { options: { memID: string } }
	SEQI: { options: { takeID: number; Layer: number } }
	SEQO: { options: { takeID: number } }
	seqStep: { options: { step: SequencerStep; sequencer: number } }
	seqFocus: { options: { sequencer: number; event: number } }
	MVBOX: {
		options: { mvType?: MultiviewerType; mvID: number; boxID: number; vidSource: string; shift?: boolean }
	}
	clipLoad: { options: { name: string } }
	clipTransport: { options: { transport: ClipTransport } }
	mediaStore: { options: { channel: number; drive: Ultra60Drive; mediaId: string } }
	acuityMediaStore: { options: { store: string; channel: number; mediaId: number } }
	msPlay: { options: { store: string; channel: number } }
	captureMediaStore: { options: { mode: CaptureMode; channel: number; source: string; frames: number } }
	captureMe: { options: { me: number; source: string; channel: number } }
	videoServer: { options: { command: VideoServerCommand; source: string } }
	cueClip: { options: { source: string; clip: string } }
	mnem: { options: { source: string; name: string } }
	userVar: { options: { name: string; operation: UserVariableOperation; value: number } }
	setVidMode: { options: { target: VideoModeTarget; format: string } }
	resetAll: { options: Record<string, never> }
	TIMER: { options: { timerAction: TimerAction; timerID: number } }
	routerXpt: { options: { destination: string; source: string; userId: number; levels: string } }
	logoLoad: { options: { channel: number; file: string } }
	effectArm: { options: { effect: number; armed: boolean } }
	effectState: { options: { effect: number; onAir: boolean } }
}

export type Definition<K extends keyof RossTalkActions> = CompanionActionDefinition<RossTalkActions[K]['options']>
type ActionDefinitions = CompanionActionDefinitions<RossTalkActions>
export type ModelActions = Partial<ActionDefinitions>

export function GetActionDefinitions(self: RossTalkInstance, model: Model): ActionDefinitions {
	const shared = new SharedActions(self)
	const { send } = shared

	const modelActions = ((): ModelActions => {
		switch (model) {
			case 'carbonite':
				return CarboniteActions(shared)
			case 'acuity':
				return AcuityActions(shared, model)
			case 'ultrix':
				return UltrixActions(shared)
			case 'opengear':
				return OpenGearActions(shared)
		}
	})()

	// Actions the model doesn't support are left out, which is the same as defining them as undefined
	return {
		gpi: {
			// Ultrix treats GPI as a salvo trigger
			name: model === 'ultrix' ? 'Fire salvo' : 'Trigger GPI',
			options: [numberField('gpi', 'Number', 1, 0)],
			callback: (event) => send(gpiCommand(model, event.options.gpi)),
		},
		gpiByName: {
			name: 'Trigger GPI by Name',
			description: 'Only works on devices that accept named GPIs',
			options: [textField('gpi', 'Name', '', {}), textField('parameter', 'Parameter', '', {})],
			callback: (event) => {
				if (event.options.gpi) send(gpiByNameCommand(event.options.gpi, event.options.parameter))
			},
		},
		custom: {
			name: 'Send a custom command',
			description: 'Refer to RossTalk Guide',
			options: [textField('cmd', 'Command', '', {})],
			callback: (event) => {
				if (event.options.cmd) send(event.options.cmd)
			},
		},
		...modelActions,
	} satisfies ModelActions as ActionDefinitions
}
