import { describe, expect, it } from 'vitest'
import {
	effectArmCommand,
	effectStateCommand,
	logoLoadCommand,
	openGearKeyTransitionCommand,
	routerCrosspointCommand,
	acuityMediaStoreCommand,
	acuitySaveSetCommand,
	captureMeCommand,
	captureToMediaStoreCommand,
	cueClipCommand,
	gpiOutputCommand,
	keyShapedCommand,
	mediaStorePlayCommand,
	resetAllCommand,
	setVideoModeCommand,
	userVariableCommand,
	videoServerCommand,
	chromaKeyInitCommand,
	clipLoadCommand,
	clipTransportCommand,
	exportRpmSetCommand,
	keyModeCommand,
	mediaStoreCommand,
	memorySaveCommand,
	mnemonicCommand,
	noopCommand,
	saveSetCommand,
	sequencerFocusCommand,
	sequencerStepCommand,
	transitionIncludeCommand,
	transitionRateCommand,
	transitionTypeCommand,
	autoTransitionCommand,
	crosspointCommand,
	customControlCommand,
	cutCommand,
	fadeToBlackCommand,
	gpiByNameCommand,
	gpiCommand,
	keyTransitionCommand,
	loadSetCommand,
	memoryCommand,
	multiviewerBoxCommand,
	sequenceInCommand,
	sequenceOutCommand,
	timerCommand,
} from './commands.js'

describe('gpiCommand', () => {
	it('pads single digits for carbonite and acuity', () => {
		expect(gpiCommand('carbonite', 3)).toBe('GPI 03')
		expect(gpiCommand('acuity', 9)).toBe('GPI 09')
		expect(gpiCommand('carbonite', 12)).toBe('GPI 12')
	})

	it('does not pad for other models', () => {
		expect(gpiCommand('ultrix', 3)).toBe('GPI 3')
		expect(gpiCommand('opengear', 3)).toBe('GPI 3')
	})
})

describe('gpiByNameCommand', () => {
	it('omits the parameter when empty', () => {
		expect(gpiByNameCommand('start', '')).toBe('GPI start')
	})

	it('appends the parameter', () => {
		expect(gpiByNameCommand('start', 'x')).toBe('GPI start:x')
	})
})

describe('customControlCommand', () => {
	it('pads the control number to two digits', () => {
		expect(customControlCommand(1, 5)).toBe('CC 1:05')
		expect(customControlCommand(2, 15)).toBe('CC 2:15')
	})
})

describe('loadSetCommand', () => {
	it('builds with and without a location', () => {
		expect(loadSetCommand('set1', null)).toBe('LOADSET set1')
		expect(loadSetCommand('set1', 'USB')).toBe('LOADSET USB:set1')
		expect(loadSetCommand('set1', '1')).toBe('LOADSET 1:set1')
	})
})

describe('keyTransitionCommand', () => {
	it('toggles without a direction', () => {
		expect(keyTransitionCommand('AUTO', 'TOGGLE', 'ME:1', 2)).toBe('KEYAUTO ME:1:2')
	})

	it('includes an explicit direction', () => {
		expect(keyTransitionCommand('CUT', 'ON', 'ME:2', 1)).toBe('KEYCUTON ME:2:1')
		expect(keyTransitionCommand('AUTO', 'OFF', 'ME:1', 4)).toBe('KEYAUTOOFF ME:1:4')
	})
})

describe('simple commands', () => {
	it('builds each command', () => {
		expect(cutCommand('ME:1')).toBe('MECUT ME:1')
		expect(autoTransitionCommand('ME:1')).toBe('MEAUTO ME:1')
		expect(crosspointCommand('ME:1:PGM', 'IN:20')).toBe('XPT ME:1:PGM:IN:20')
		expect(fadeToBlackCommand()).toBe('FTB')
		expect(memoryCommand('19:ME:2:MME:1')).toBe('MEM 19:ME:2:MME:1')
		expect(sequenceInCommand(3, 1)).toBe('SEQI 3:1')
		expect(sequenceOutCommand(3)).toBe('SEQO 3')
		expect(multiviewerBoxCommand('VP', 1, 4, 'IN:5', false)).toBe('MVBOX VP:1:4:IN:5')
		expect(multiviewerBoxCommand('IO', 2, 1, 'AUX:3', false)).toBe('MVBOX IO:2:1:AUX:3')
		expect(timerCommand(2, 'PAUSE')).toBe('TIMER 2:PAUSE')
	})
})

describe('transitionIncludeCommand', () => {
	it('includes the background first, then keys in order', () => {
		expect(transitionIncludeCommand('ME:2', true, [3, 2])).toBe('TRANSINCL ME:2:B:2:3')
	})

	it('can include keys only', () => {
		expect(transitionIncludeCommand('ME:1', false, [1])).toBe('TRANSINCL ME:1:1')
	})

	it('returns null when nothing is included', () => {
		expect(transitionIncludeCommand('ME:1', false, [])).toBeNull()
	})
})

describe('carbonite commands from the RossTalk spec', () => {
	it('matches the documented examples', () => {
		expect(saveSetCommand('set1', null)).toBe('SAVESET set1')
		expect(saveSetCommand('set1', '0')).toBe('SAVESET 0:set1')
		expect(exportRpmSetCommand('myset')).toBe('EXPORTRPMSET myset')
		expect(memorySaveCommand('19:ME:2:MME:1')).toBe('MEMSAVE 19:ME:2:MME:1')
		expect(sequencerStepCommand('NEXT', 2)).toBe('NEXT 2')
		expect(sequencerStepCommand('DOWN', 4)).toBe('DOWN 4')
		expect(sequencerFocusCommand(3, 2)).toBe('FOCUS 3:2')
		expect(transitionRateCommand('ME:1', 15)).toBe('TRANSRATE ME:1:15')
		expect(transitionTypeCommand('MSC:2', 'DISS')).toBe('TRANSTYPE MSC:2:DISS')
		expect(keyModeCommand('ME:2', 1, 'NORMAL')).toBe('KEYMODE ME:2:1:NORMAL')
		expect(chromaKeyInitCommand(2)).toBe('CKINIT 2')
		expect(clipLoadCommand('trees')).toBe('CLIPLOAD trees')
		expect(clipTransportCommand('LOOPON')).toBe('CLIPLOOPON')
		expect(mediaStoreCommand(1, '0', '002')).toBe('MS 1:0:002')
		expect(mnemonicCommand('IN:6', 'CAM 1')).toBe('MNEM IN:6:CAM 1')
		expect(multiviewerBoxCommand('VP', 1, 5, 'IN:6', true)).toBe('MVBOXSHIFT VP:1:5:IN:6')
		expect(noopCommand()).toBe('NOOP')
	})
})

describe('acuity commands from the RossTalk spec', () => {
	it('matches the documented examples', () => {
		expect(gpiOutputCommand('acuity', 4, 'OFF')).toBe('GPI 04:Off')
		expect(acuitySaveSetCommand('USB', 5, 'MORNING')).toBe('SAVESET USB:5:MORNING')
		expect(acuitySaveSetCommand('HD', null, 'MORNING')).toBe('SAVESET HD:MORNING')
		expect(transitionRateCommand('2', 15)).toBe('TRANSRATE 2:15')
		expect(transitionTypeCommand('3', 'DISS')).toBe('TRANSTYPE 3:DISS')
		expect(transitionIncludeCommand('2', true, [2, 3])).toBe('TRANSINCL 2:B:2:3')
		expect(memorySaveCommand('23:1:2:4')).toBe('MEMSAVE 23:1:2:4')
		expect(keyTransitionCommand('AUTO', 'ON', '3', 2)).toBe('KEYAUTOON 3:2')
		expect(keyShapedCommand('2', 1, 'ON')).toBe('KEYSHAPED 2:1:ON')
		expect(acuityMediaStoreCommand('4', 2, 52)).toBe('MS 4:2:52')
		expect(acuityMediaStoreCommand('GS', 1, 12)).toBe('MS GS:1:12')
		expect(mediaStorePlayCommand('GSA', 2)).toBe('MSPLAY GSA:2')
		expect(multiviewerBoxCommand(null, 1, 5, 'IN:6', false)).toBe('MVBOX 1:5:IN:6')
		expect(videoServerCommand('PLAY', 'IN:20')).toBe('PLAY IN:20')
		expect(videoServerCommand('EJECT', 'IN:10')).toBe('EJECT IN:10')
		expect(cueClipCommand('IN:7', 'Intro_6')).toBe('CUECLIP IN:7:Intro_6')
		expect(userVariableCommand('A', '=', 10)).toBe('USERVAR A:10')
		expect(userVariableCommand('A', '+', 5)).toBe('USERVAR A:+:5')
		expect(captureToMediaStoreCommand('DISK', 1, 'AUX:8:3', 6)).toBe('CAPTURE DISK:1:AUX:8:3:6')
		expect(captureMeCommand(3, 'PGMC', 2)).toBe('CAPTURE 3:PGMC:2')
		expect(resetAllCommand()).toBe('RESETALL')
		expect(setVideoModeCommand('REF', '1080i50')).toBe('SETVIDMODE REF:1080i50')
	})
})

describe('ultrix commands from the RossTalk spec', () => {
	it('matches the documented examples', () => {
		expect(gpiCommand('ultrix', 23)).toBe('GPI 23')
		expect(timerCommand(4, 'END')).toBe('TIMER 4:END')
		expect(routerCrosspointCommand('5', '16', 7, '1,6,10-13')).toBe('XPT D:5 S:16 I:7 L:1,6,10-13')
	})

	it('omits levels when empty and strips spaces from them', () => {
		expect(routerCrosspointCommand('5', '16', 7, '')).toBe('XPT D:5 S:16 I:7')
		expect(routerCrosspointCommand('5', '16', 7, '1, 2')).toBe('XPT D:5 S:16 I:7 L:1,2')
	})
})

describe('openGear commands from the RossTalk spec', () => {
	it('matches the documented examples', () => {
		expect(gpiCommand('opengear', 8)).toBe('GPI 8')
		expect(openGearKeyTransitionCommand('AUTO', 2)).toBe('KEYAUTO 1:2')
		expect(openGearKeyTransitionCommand('CUT', 1)).toBe('KEYCUT 1:1')
		expect(logoLoadCommand(4, 'Logo/Ross_LOGO.png')).toBe('MSPATH 4:0:Logo/Ross_LOGO.png')
		expect(effectArmCommand(3, true)).toBe('VGPIARM 3:1')
		expect(effectArmCommand(3, false)).toBe('VGPIARM 3:0')
		expect(effectStateCommand(2, true)).toBe('VGPISTATE 2:1')
		expect(effectStateCommand(2, false)).toBe('VGPISTATE 2:0')
	})
})
