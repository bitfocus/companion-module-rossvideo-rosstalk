import type { Model } from './config.js'

export type KeyTransitionType = 'AUTO' | 'CUT'
export type KeyTransitionDirection = 'TOGGLE' | 'ON' | 'OFF'
export type TimerAction = 'RUN' | 'PAUSE' | 'STOP' | 'END'
export type LoadLocation = 'USB' | 'HD'
/** Ultra 60 drives: 0 is internal, 1-3 are USB in detection order */
export type Ultra60Drive = '0' | '1' | '2' | '3'
export type TransitionType = 'DISS' | 'DVE' | 'MEDIA' | 'WIPE'
export type KeyMode = 'NORMAL' | 'ADDITIVE' | 'FULL'
export type ClipTransport = 'PLAY' | 'PAUSE' | 'EJECT' | 'LOOPON' | 'LOOPOFF'
export type SequencerStep = 'NEXT' | 'UP' | 'DOWN'
export type OnOff = 'ON' | 'OFF'
export type VideoServerCommand = 'PLAY' | 'PAUSE' | 'EJECT'
export type UserVariableOperation = '=' | '+' | '-' | '*' | '/'
export type CaptureMode = 'DISK' | 'RAM'
export type VideoModeTarget = 'REF' | 'VID'
export type MultiviewerType = 'VP' | 'IO'

function pad2(value: number): string {
	return value <= 9 ? `0${value}` : String(value)
}

export function gpiCommand(model: Model, gpi: number): string {
	// Carbonite and Acuity expect GPIs as two digits
	return 'GPI ' + (model === 'carbonite' || model === 'acuity' ? pad2(gpi) : String(gpi))
}

export function gpiOutputCommand(model: Model, gpi: number, state: OnOff): string {
	return `${gpiCommand(model, gpi)}:${state === 'ON' ? 'On' : 'Off'}`
}

export function gpiByNameCommand(name: string, parameter: string): string {
	return parameter ? `GPI ${name}:${parameter}` : `GPI ${name}`
}

export function customControlCommand(bank: number, cc: number): string {
	return `CC ${bank}:${pad2(cc)}`
}

export function loadSetCommand(set: string, location: LoadLocation | Ultra60Drive | null): string {
	return location ? `LOADSET ${location}:${set}` : `LOADSET ${set}`
}

export function saveSetCommand(set: string, location: Ultra60Drive | null): string {
	return location ? `SAVESET ${location}:${set}` : `SAVESET ${set}`
}

/** Without a setup number, Acuity matches the set name and overwrites it */
export function acuitySaveSetCommand(location: LoadLocation, setup: number | null, set: string): string {
	return setup ? `SAVESET ${location}:${setup}:${set}` : `SAVESET ${location}:${set}`
}

export function exportRpmSetCommand(name: string): string {
	return `EXPORTRPMSET ${name}`
}

export function cutCommand(mle: string): string {
	return `MECUT ${mle}`
}

export function autoTransitionCommand(mle: string): string {
	return `MEAUTO ${mle}`
}

export function crosspointCommand(destination: string, source: string): string {
	return `XPT ${destination}:${source}`
}

export function keyTransitionCommand(
	type: KeyTransitionType,
	direction: KeyTransitionDirection,
	mle: string,
	key: number,
): string {
	return `KEY${type}${direction === 'TOGGLE' ? '' : direction} ${mle}:${key}`
}

export function fadeToBlackCommand(): string {
	return 'FTB'
}

export function memoryCommand(memId: string): string {
	return `MEM ${memId}`
}

export function memorySaveCommand(memId: string): string {
	return `MEMSAVE ${memId}`
}

export function sequenceInCommand(sequencer: number, sequence: number): string {
	return `SEQI ${sequencer}:${sequence}`
}

export function sequenceOutCommand(sequencer: number): string {
	return `SEQO ${sequencer}`
}

/** Carbonite needs the MultiViewer type (VP or IO); Acuity has none */
export function multiviewerBoxCommand(
	type: MultiviewerType | null,
	multiviewer: number,
	box: number,
	source: string,
	shifted: boolean,
): string {
	const address = [...(type ? [type] : []), multiviewer, box, source].join(':')
	return `${shifted ? 'MVBOXSHIFT' : 'MVBOX'} ${address}`
}

export function timerCommand(timer: number, action: TimerAction): string {
	return `TIMER ${timer}:${action}`
}

export function sequencerStepCommand(step: SequencerStep, sequencer: number): string {
	return `${step} ${sequencer}`
}

export function sequencerFocusCommand(sequencer: number, event: number): string {
	return `FOCUS ${sequencer}:${event}`
}

export function transitionRateCommand(mle: string, frames: number): string {
	return `TRANSRATE ${mle}:${frames}`
}

export function transitionTypeCommand(mle: string, type: TransitionType): string {
	return `TRANSTYPE ${mle}:${type}`
}

/** Returns null when nothing is included, as the switcher needs at least one element */
export function transitionIncludeCommand(mle: string, background: boolean, keys: number[]): string | null {
	const elements = [...(background ? ['B'] : []), ...[...keys].sort((a, b) => a - b).map(String)]
	return elements.length > 0 ? `TRANSINCL ${mle}:${elements.join(':')}` : null
}

export function keyModeCommand(mle: string, key: number, mode: KeyMode): string {
	return `KEYMODE ${mle}:${key}:${mode}`
}

export function chromaKeyInitCommand(chromaKey: number): string {
	return `CKINIT ${chromaKey}`
}

export function clipLoadCommand(name: string): string {
	return `CLIPLOAD ${name}`
}

export function clipTransportCommand(transport: ClipTransport): string {
	return `CLIP${transport}`
}

export function mediaStoreCommand(channel: number, location: Ultra60Drive, mediaId: string): string {
	return `MS ${channel}:${location}:${mediaId}`
}

export function mnemonicCommand(source: string, name: string): string {
	return `MNEM ${source}:${name}`
}

export function noopCommand(): string {
	return 'NOOP'
}

export function keyShapedCommand(mle: string, key: number, state: OnOff): string {
	return `KEYSHAPED ${mle}:${key}:${state}`
}

export function acuityMediaStoreCommand(store: string, channel: number, mediaId: number): string {
	return `MS ${store}:${channel}:${mediaId}`
}

export function mediaStorePlayCommand(store: string, channel: number): string {
	return `MSPLAY ${store}:${channel}`
}

export function videoServerCommand(command: VideoServerCommand, source: string): string {
	return `${command} ${source}`
}

export function cueClipCommand(source: string, clip: string): string {
	return `CUECLIP ${source}:${clip}`
}

export function userVariableCommand(name: string, operation: UserVariableOperation, value: number): string {
	return operation === '=' ? `USERVAR ${name}:${value}` : `USERVAR ${name}:${operation}:${value}`
}

export function captureToMediaStoreCommand(mode: CaptureMode, channel: number, source: string, frames: number): string {
	return `CAPTURE ${mode}:${channel}:${source}:${frames}`
}

export function captureMeCommand(me: number, source: string, channel: number): string {
	return `CAPTURE ${me}:${source}:${channel}`
}

export function resetAllCommand(): string {
	return 'RESETALL'
}

export function setVideoModeCommand(target: VideoModeTarget, format: string): string {
	return `SETVIDMODE ${target}:${format}`
}

/** Levels are optional; they are a comma separated list which may contain ranges, e.g. 1,6,10-13 */
export function routerCrosspointCommand(destination: string, source: string, userId: number, levels: string): string {
	const trimmedLevels = levels.replace(/\s/g, '')
	return `XPT D:${destination} S:${source} I:${userId}` + (trimmedLevels ? ` L:${trimmedLevels}` : '')
}

/** openGear cards only have one ME, which RossTalk addresses as 1 */
export function openGearKeyTransitionCommand(type: KeyTransitionType, key: number): string {
	return `KEY${type} 1:${key}`
}

/** Media is always loaded from the CompactFlash card, which RossTalk addresses as 0 */
export function logoLoadCommand(channel: number, file: string): string {
	return `MSPATH ${channel}:0:${file}`
}

export function effectArmCommand(effect: number, armed: boolean): string {
	return `VGPIARM ${effect}:${armed ? 1 : 0}`
}

export function effectStateCommand(effect: number, onAir: boolean): string {
	return `VGPISTATE ${effect}:${onAir ? 1 : 0}`
}
