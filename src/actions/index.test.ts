import { describe, expect, it, vi } from 'vitest'
import type { Model } from '../config.js'
import type RossTalkInstance from '../main.js'
import { GetPresets } from '../presets.js'
import { GetActionDefinitions, type RossTalkActions } from './index.js'

type ActionId = keyof RossTalkActions

/** One case per documented form of a command: the action's options and the command(s) it should send */
type Case = { options: Record<string, unknown>; sends: string | null }
type ModelCases = Partial<Record<ActionId, Case[]>>

function harness(model: Model) {
	const sent: string[] = []
	const log = vi.fn()
	const self = { sendCommand: (cmd: string) => sent.push(cmd), log } as unknown as RossTalkInstance
	const definitions = GetActionDefinitions(self, model)

	const definition = (actionId: ActionId) => {
		const found = definitions[actionId]
		if (!found) throw new Error(`${model} has no ${actionId} action`)
		return found
	}

	return {
		sent,
		log,
		definition,
		ids: () =>
			Object.entries(definitions)
				.filter(([, found]) => found)
				.map(([id]) => id),
		run: (actionId: ActionId, options: Record<string, unknown>): void => {
			// Callbacks only read the options, so the rest of the event and context isn't needed
			const callback: any = definition(actionId).callback
			callback({ actionId, options }, {})
		},
	}
}

function parseRegex(regex: string): RegExp {
	const match = /^\/(.*)\/([a-z]*)$/.exec(regex)
	if (!match) throw new Error(`Not a regex: ${regex}`)
	return new RegExp(match[1], match[2])
}

/** The regex shown to the user for an action's option */
function optionRegex(model: Model, actionId: ActionId, optionId: string): RegExp {
	const option = harness(model)
		.definition(actionId)
		.options.find((o) => o.id === optionId)
	if (!option || !('regex' in option) || !option.regex) throw new Error(`${actionId}.${optionId} has no regex`)
	return parseRegex(option.regex)
}

function testModel(model: Model, cases: ModelCases): void {
	describe(`${model} actions`, () => {
		it('has a case for every action', () => {
			expect(Object.keys(cases).sort()).toEqual(harness(model).ids().sort())
		})

		for (const [actionId, actionCases] of Object.entries(cases) as [ActionId, Case[]][]) {
			it.each(actionCases)(`${actionId} with %j`, ({ options, sends }) => {
				const { sent, run } = harness(model)
				run(actionId, options)
				expect(sent).toEqual(sends === null ? [] : [sends])
			})
		}
	})
}

// Examples are taken from the RossTalk reference (4802DR-403-35) wherever it has one
testModel('carbonite', {
	gpi: [
		{ options: { gpi: 4 }, sends: 'GPI 04' },
		{ options: { gpi: 12 }, sends: 'GPI 12' },
	],
	gpiByName: [
		{ options: { gpi: '08', parameter: 'HIGH' }, sends: 'GPI 08:HIGH' },
		{ options: { gpi: '12', parameter: 'LOW' }, sends: 'GPI 12:LOW' },
		{ options: { gpi: '', parameter: 'HIGH' }, sends: null },
	],
	custom: [
		{ options: { cmd: 'HELP' }, sends: 'HELP' },
		{ options: { cmd: '' }, sends: null },
	],
	cc: [{ options: { bank: 1, cc: 5 }, sends: 'CC 1:05' }],
	loadset: [
		{ options: { set: 'set1', drive: '' }, sends: 'LOADSET set1' },
		{ options: { set: 'set1', drive: '1' }, sends: 'LOADSET 1:set1' },
		{ options: { set: 'set5', drive: '0' }, sends: 'LOADSET 0:set5' },
	],
	saveset: [
		{ options: { set: 'set1', drive: '' }, sends: 'SAVESET set1' },
		{ options: { set: 'set1', drive: '0' }, sends: 'SAVESET 0:set1' },
		{ options: { set: 'news6', drive: '1' }, sends: 'SAVESET 1:news6' },
	],
	cut: [
		{ options: { mle: 'ME:1' }, sends: 'MECUT ME:1' },
		{ options: { mle: 'ME:P/P' }, sends: 'MECUT ME:P/P' },
		{ options: { mle: 'ME:1B' }, sends: 'MECUT ME:1B' },
	],
	autotrans: [{ options: { mle: 'MSC:2' }, sends: 'MEAUTO MSC:2' }],
	transRate: [{ options: { mle: 'ME:1', rate: 15 }, sends: 'TRANSRATE ME:1:15' }],
	transType: [
		{ options: { mle: 'MSC:2', type: 'DISS' }, sends: 'TRANSTYPE MSC:2:DISS' },
		{ options: { mle: 'ME:1', type: 'MEDIA' }, sends: 'TRANSTYPE ME:1:MEDIA' },
	],
	transIncl: [
		{ options: { mle: 'ME:2', background: true, keys: [2, 3] }, sends: 'TRANSINCL ME:2:B:2:3' },
		{ options: { mle: 'ME:2', background: false, keys: [] }, sends: null },
	],
	xpt: [
		{ options: { vidDest: 'ME:2:PGM', vidSource: 'IN:6' }, sends: 'XPT ME:2:PGM:IN:6' },
		{ options: { vidDest: 'ME:3:KEY:2', vidSource: 'IN:20' }, sends: 'XPT ME:3:KEY:2:IN:20' },
		{ options: { vidDest: 'AUX:2', vidSource: 'ME:1:CLN' }, sends: 'XPT AUX:2:ME:1:CLN' },
		{ options: { vidDest: 'AUX:1', vidSource: 'SCN:1' }, sends: 'XPT AUX:1:SCN:1' },
	],
	transKey: [
		{ options: { mle: 'ME:1', key: 4, transT: 'AUTO', transD: 'TOGGLE' }, sends: 'KEYAUTO ME:1:4' },
		{ options: { mle: 'ME:1', key: 4, transT: 'AUTO', transD: 'OFF' }, sends: 'KEYAUTOOFF ME:1:4' },
		{ options: { mle: 'ME:1', key: 4, transT: 'AUTO', transD: 'ON' }, sends: 'KEYAUTOON ME:1:4' },
		{ options: { mle: 'MME:2', key: 1, transT: 'CUT', transD: 'TOGGLE' }, sends: 'KEYCUT MME:2:1' },
		{ options: { mle: 'MME:2', key: 1, transT: 'CUT', transD: 'OFF' }, sends: 'KEYCUTOFF MME:2:1' },
		{ options: { mle: 'MME:2', key: 1, transT: 'CUT', transD: 'ON' }, sends: 'KEYCUTON MME:2:1' },
		{ options: { mle: 'ME:P/P', key: 4, transT: 'AUTO', transD: 'TOGGLE' }, sends: 'KEYAUTO ME:P/P:4' },
	],
	keyMode: [
		{ options: { mle: 'ME:2', key: 1, mode: 'NORMAL' }, sends: 'KEYMODE ME:2:1:NORMAL' },
		{ options: { mle: 'ME:1', key: 2, mode: 'ADDITIVE' }, sends: 'KEYMODE ME:1:2:ADDITIVE' },
		{ options: { mle: 'ME:1', key: 2, mode: 'FULL' }, sends: 'KEYMODE ME:1:2:FULL' },
	],
	ckInit: [{ options: { chromaKey: 2 }, sends: 'CKINIT 2' }],
	ftb: [{ options: {}, sends: 'FTB' }],
	MEM: [{ options: { memID: '19:ME:2:MME:1:CK:1' }, sends: 'MEM 19:ME:2:MME:1:CK:1' }],
	memSave: [{ options: { memID: '25:ME:1:MME:3' }, sends: 'MEMSAVE 25:ME:1:MME:3' }],
	SEQI: [{ options: { takeID: 3, Layer: 15 }, sends: 'SEQI 3:15' }],
	SEQO: [{ options: { takeID: 1 }, sends: 'SEQO 1' }],
	seqStep: [
		{ options: { step: 'NEXT', sequencer: 2 }, sends: 'NEXT 2' },
		{ options: { step: 'UP', sequencer: 1 }, sends: 'UP 1' },
		{ options: { step: 'DOWN', sequencer: 4 }, sends: 'DOWN 4' },
	],
	seqFocus: [{ options: { sequencer: 3, event: 2 }, sends: 'FOCUS 3:2' }],
	MVBOX: [
		{ options: { mvType: 'VP', mvID: 1, boxID: 5, vidSource: 'IN:6', shift: false }, sends: 'MVBOX VP:1:5:IN:6' },
		{ options: { mvType: 'VP', mvID: 1, boxID: 5, vidSource: 'IN:6', shift: true }, sends: 'MVBOXSHIFT VP:1:5:IN:6' },
		{ options: { mvType: 'IO', mvID: 2, boxID: 1, vidSource: 'AUX:3', shift: false }, sends: 'MVBOX IO:2:1:AUX:3' },
	],
	clipLoad: [
		{ options: { name: 'trees' }, sends: 'CLIPLOAD trees' },
		{ options: { name: '' }, sends: null },
	],
	clipTransport: [
		{ options: { transport: 'PLAY' }, sends: 'CLIPPLAY' },
		{ options: { transport: 'PAUSE' }, sends: 'CLIPPAUSE' },
		{ options: { transport: 'EJECT' }, sends: 'CLIPEJECT' },
		{ options: { transport: 'LOOPON' }, sends: 'CLIPLOOPON' },
		{ options: { transport: 'LOOPOFF' }, sends: 'CLIPLOOPOFF' },
	],
	mediaStore: [
		{ options: { channel: 1, drive: '0', mediaId: '002' }, sends: 'MS 1:0:002' },
		{ options: { channel: 101, drive: '1', mediaId: '035' }, sends: 'MS 101:1:035' },
	],
	mnem: [
		{ options: { source: 'IN:6', name: 'CAM 1' }, sends: 'MNEM IN:6:CAM 1' },
		{ options: { source: 'IN:6', name: '' }, sends: null },
	],
})

testModel('acuity', {
	gpi: [{ options: { gpi: 4 }, sends: 'GPI 04' }],
	gpiOutput: [
		{ options: { gpi: 4, state: 'OFF' }, sends: 'GPI 04:Off' },
		{ options: { gpi: 4, state: 'ON' }, sends: 'GPI 04:On' },
	],
	gpiByName: [{ options: { gpi: 'start', parameter: '' }, sends: 'GPI start' }],
	custom: [{ options: { cmd: 'VERSION' }, sends: 'VERSION' }],
	cc: [{ options: { bank: 1, cc: 5 }, sends: 'CC 1:05' }],
	loadset: [
		{ options: { location: 'HD', set: 'SETUP01' }, sends: 'LOADSET HD:SETUP01' },
		{ options: { location: 'USB', set: 'SETUP01' }, sends: 'LOADSET USB:SETUP01' },
	],
	saveset: [
		{ options: { location: 'USB', setup: 5, set: 'MORNING' }, sends: 'SAVESET USB:5:MORNING' },
		{ options: { location: 'HD', setup: 0, set: 'MORNING' }, sends: 'SAVESET HD:MORNING' },
	],
	cut: [{ options: { mle: '1' }, sends: 'MECUT 1' }],
	autotrans: [{ options: { mle: '2' }, sends: 'MEAUTO 2' }],
	transRate: [{ options: { mle: '2', rate: 15 }, sends: 'TRANSRATE 2:15' }],
	transType: [
		{ options: { mle: '3', type: 'DISS' }, sends: 'TRANSTYPE 3:DISS' },
		{ options: { mle: '3', type: 'SEQ' }, sends: 'TRANSTYPE 3:SEQ' },
	],
	transIncl: [{ options: { mle: '2', background: true, keys: [2, 3] }, sends: 'TRANSINCL 2:B:2:3' }],
	xpt: [
		{ options: { vidDest: 'MLE:2:PGM', vidSource: 'IN:6' }, sends: 'XPT MLE:2:PGM:IN:6' },
		{ options: { vidDest: 'AUX:1:3', vidSource: 'MLE:1:PGM:C' }, sends: 'XPT AUX:1:3:MLE:1:PGM:C' },
		{ options: { vidDest: 'MLE:1:KEY:2:KEYBUS:2', vidSource: 'GS:1' }, sends: 'XPT MLE:1:KEY:2:KEYBUS:2:GS:1' },
	],
	transKey: [
		{ options: { mle: '1', key: 4, transT: 'AUTO', transD: 'TOGGLE' }, sends: 'KEYAUTO 1:4' },
		{ options: { mle: '3', key: 2, transT: 'AUTO', transD: 'ON' }, sends: 'KEYAUTOON 3:2' },
		{ options: { mle: '1', key: 4, transT: 'AUTO', transD: 'OFF' }, sends: 'KEYAUTOOFF 1:4' },
		{ options: { mle: '2', key: 1, transT: 'CUT', transD: 'TOGGLE' }, sends: 'KEYCUT 2:1' },
		{ options: { mle: '3', key: 2, transT: 'CUT', transD: 'ON' }, sends: 'KEYCUTON 3:2' },
		{ options: { mle: '1', key: 4, transT: 'CUT', transD: 'OFF' }, sends: 'KEYCUTOFF 1:4' },
	],
	keyShaped: [
		{ options: { mle: '2', key: 1, state: 'ON' }, sends: 'KEYSHAPED 2:1:ON' },
		{ options: { mle: '2', key: 1, state: 'OFF' }, sends: 'KEYSHAPED 2:1:OFF' },
	],
	ftb: [{ options: {}, sends: 'FTB' }],
	MEM: [{ options: { memID: '19:2:1' }, sends: 'MEM 19:2:1' }],
	memSave: [{ options: { memID: '23:1:2:4' }, sends: 'MEMSAVE 23:1:2:4' }],
	MVBOX: [{ options: { mvID: 1, boxID: 5, vidSource: 'IN:6' }, sends: 'MVBOX 1:5:IN:6' }],
	acuityMediaStore: [
		{ options: { store: '4', channel: 2, mediaId: 52 }, sends: 'MS 4:2:52' },
		{ options: { store: 'GS', channel: 1, mediaId: 12 }, sends: 'MS GS:1:12' },
	],
	msPlay: [{ options: { store: 'GSA', channel: 2 }, sends: 'MSPLAY GSA:2' }],
	captureMediaStore: [
		{ options: { mode: 'DISK', channel: 1, source: 'AUX:8:3', frames: 6 }, sends: 'CAPTURE DISK:1:AUX:8:3:6' },
		{ options: { mode: 'RAM', channel: 2, source: 'IN:1', frames: 30 }, sends: 'CAPTURE RAM:2:IN:1:30' },
	],
	captureMe: [
		{ options: { me: 3, source: 'PGMC', channel: 2 }, sends: 'CAPTURE 3:PGMC:2' },
		{ options: { me: 1, source: 'PGM', channel: 1 }, sends: 'CAPTURE 1:PGM:1' },
	],
	videoServer: [
		{ options: { command: 'PLAY', source: 'IN:20' }, sends: 'PLAY IN:20' },
		{ options: { command: 'PAUSE', source: 'IN:20' }, sends: 'PAUSE IN:20' },
		{ options: { command: 'EJECT', source: 'IN:10' }, sends: 'EJECT IN:10' },
	],
	cueClip: [
		{ options: { source: 'IN:7', clip: 'Intro_6' }, sends: 'CUECLIP IN:7:Intro_6' },
		{ options: { source: 'IN:7', clip: '' }, sends: null },
	],
	mnem: [{ options: { source: 'IN:6', name: 'CAM 1' }, sends: 'MNEM IN:6:CAM 1' }],
	userVar: [
		{ options: { name: 'A', operation: '=', value: 10 }, sends: 'USERVAR A:10' },
		{ options: { name: 'A', operation: '+', value: 5 }, sends: 'USERVAR A:+:5' },
		{ options: { name: 'A', operation: '-', value: 5 }, sends: 'USERVAR A:-:5' },
		{ options: { name: 'A', operation: '*', value: 2 }, sends: 'USERVAR A:*:2' },
		{ options: { name: 'A', operation: '/', value: 2 }, sends: 'USERVAR A:/:2' },
		{ options: { name: 'A', operation: '=', value: -3 }, sends: 'USERVAR A:-3' },
		{ options: { name: '', operation: '=', value: 1 }, sends: null },
	],
	setVidMode: [
		{ options: { target: 'REF', format: '1080i 50' }, sends: 'SETVIDMODE REF:1080i 50' },
		{ options: { target: 'VID', format: '1080i 59.94' }, sends: 'SETVIDMODE VID:1080i 59.94' },
		{ options: { target: 'VID', format: '480i 16x9' }, sends: 'SETVIDMODE VID:480i 16x9' },
		{ options: { target: 'VID', format: '' }, sends: null },
	],
	resetAll: [{ options: {}, sends: 'RESETALL' }],
})

testModel('ultrix', {
	gpi: [{ options: { gpi: 23 }, sends: 'GPI 23' }],
	gpiByName: [{ options: { gpi: 'salvo', parameter: '' }, sends: 'GPI salvo' }],
	custom: [{ options: { cmd: 'GPI 1' }, sends: 'GPI 1' }],
	TIMER: [
		{ options: { timerID: 4, timerAction: 'END' }, sends: 'TIMER 4:END' },
		{ options: { timerID: 1, timerAction: 'PAUSE' }, sends: 'TIMER 1:PAUSE' },
		{ options: { timerID: 3, timerAction: 'RUN' }, sends: 'TIMER 3:RUN' },
		{ options: { timerID: 2, timerAction: 'STOP' }, sends: 'TIMER 2:STOP' },
	],
	routerXpt: [
		{
			options: { destination: '5', source: '16', userId: 7, levels: '1,6,10-13' },
			sends: 'XPT D:5 S:16 I:7 L:1,6,10-13',
		},
		{ options: { destination: '5', source: '16', userId: 7, levels: '' }, sends: 'XPT D:5 S:16 I:7' },
	],
})

testModel('opengear', {
	gpi: [{ options: { gpi: 8 }, sends: 'GPI 8' }],
	gpiByName: [{ options: { gpi: 'go', parameter: '' }, sends: 'GPI go' }],
	custom: [{ options: { cmd: 'FTB' }, sends: 'FTB' }],
	ftb: [{ options: {}, sends: 'FTB' }],
	transKey: [
		{ options: { key: 2, transT: 'AUTO' }, sends: 'KEYAUTO 1:2' },
		{ options: { key: 1, transT: 'CUT' }, sends: 'KEYCUT 1:1' },
	],
	logoLoad: [
		{ options: { channel: 4, file: 'Logo/Ross_LOGO.png' }, sends: 'MSPATH 4:0:Logo/Ross_LOGO.png' },
		{ options: { channel: 4, file: '' }, sends: null },
	],
	effectArm: [
		{ options: { effect: 3, armed: true }, sends: 'VGPIARM 3:1' },
		{ options: { effect: 3, armed: false }, sends: 'VGPIARM 3:0' },
	],
	effectState: [
		{ options: { effect: 2, onAir: true }, sends: 'VGPISTATE 2:1' },
		{ options: { effect: 2, onAir: false }, sends: 'VGPISTATE 2:0' },
	],
})

testModel('videoserver', {
	custom: [{ options: { cmd: 'PLAY A' }, sends: 'PLAY A' }],
	serverCue: [
		{ options: { channel: 'D', clip: 'crime-report', timecode: '' }, sends: 'CUE D:crime-report' },
		{
			options: { channel: 'A', clip: 'goal-highlight', timecode: '00,00,15,00' },
			sends: 'CUE A:goal-highlight:00,00,15,00',
		},
		{ options: { channel: 'A', clip: '\\news\\crime-report', timecode: '' }, sends: 'CUE A:\\news\\crime-report' },
		{ options: { channel: 'A', clip: '', timecode: '' }, sends: null },
	],
	serverPlay: [
		{ options: { channel: 'B', clip: '', timecode: '' }, sends: 'PLAY B' },
		{ options: { channel: 'B', clip: 'storm', timecode: '' }, sends: 'PLAY B:storm' },
		{ options: { channel: 'B', clip: 'storm', timecode: '00,00,03,10' }, sends: 'PLAY B:storm:00,00,03,10' },
		{ options: { channel: 'B', clip: '', timecode: '00,00,03,10' }, sends: 'PLAY B' },
	],
	serverStop: [{ options: { channel: 'F' }, sends: 'STOP F' }],
	serverEject: [{ options: { channel: 'A' }, sends: 'EJECT A' }],
	serverGoto: [{ options: { channel: 'A', timecode: '00,00,00,20' }, sends: 'GOTO A:00,00,00,20' }],
	serverJog: [
		{ options: { channel: 'C', frames: -20 }, sends: 'JOG C:-20f' },
		{ options: { channel: 'C', frames: 5 }, sends: 'JOG C:5f' },
	],
	serverLoop: [
		{ options: { channel: 'B', mode: 'loop' }, sends: 'LOOP B:loop' },
		{ options: { channel: 'B', mode: 'off' }, sends: 'LOOP B:off' },
		{ options: { channel: 'B', mode: 'loop-to' }, sends: 'LOOP B:loop-to' },
		{ options: { channel: 'B', mode: 'ping-pong' }, sends: 'LOOP B:ping-pong' },
		{ options: { channel: 'B', mode: 'ping-pong-to' }, sends: 'LOOP B:ping-pong-to' },
	],
	serverAngle: [{ options: { channel: 'A', angle: 3 }, sends: 'ANGLE A:3' }],
})

describe('actions that send nothing', () => {
	it('warns when no transition elements are selected', () => {
		const { sent, log, run } = harness('carbonite')
		run('transIncl', { mle: 'ME:1', background: false, keys: [] })
		expect(sent).toEqual([])
		expect(log).toHaveBeenCalledWith('warn', expect.stringContaining('nothing selected'))
	})
})

describe('option validation', () => {
	const cases: [Model, ActionId, string, string[], string[]][] = [
		[
			'carbonite',
			'cut',
			'mle',
			['ME:1', 'MME:2', 'MSC:2', 'ME:P/P', 'ME:10', 'ME:1A', 'ME:1B', 'ME:PP', 'ME:PPB', 'ME:PPAB'],
			['ME', '1', 'ME:1:2', 'IN:1', 'ME:1C', 'ME:1BA', 'MME:1B', 'ME:P/PB'],
		],
		[
			'carbonite',
			'MEM',
			'memID',
			['19:ME:2:MME:1:CK:1', '25:ME:1:MME:3', '11:ME:P/P', '19:CK:1', '19:ME:PPB', '19:ME:1A:ME:2'],
			['19', '1:ME:1', '19:CK', '19:IN:1', '19:ME:1:', '19:MME:1B'],
		],
		['carbonite', 'memSave', 'memID', ['25:ME:1:MME:3'], ['25']],
		['carbonite', 'mediaStore', 'mediaId', ['002', '035'], ['', 'abc', '1.5']],
		['acuity', 'cut', 'mle', ['1', '2'], ['ME:1', 'MLE:1', '']],
		['acuity', 'MEM', 'memID', ['19:2:1', '23:1:2:4'], ['19', '19:ME:1', '1:1']],
		['ultrix', 'routerXpt', 'levels', ['', '1', '1,6,10-13', '10-13'], ['1, 6', '1-', ',1', '1,,2', 'a']],
		['videoserver', 'serverGoto', 'timecode', ['00,00,00,20', '01,02,03,04'], ['', '00:00:00:20', '0,0,0,0']],
		['videoserver', 'serverCue', 'timecode', ['', '00,00,15,00'], ['00:00:15:00', '15']],
		['videoserver', 'serverPlay', 'timecode', ['', '00,00,03,10'], ['00,00,03']],
	]

	describe.each(cases)('%s %s %s', (model, actionId, optionId, valid, invalid) => {
		const regex = optionRegex(model, actionId, optionId)

		it.each(valid)('accepts %j', (value) => expect(regex.test(value)).toBe(true))
		it.each(invalid)('rejects %j', (value) => expect(regex.test(value)).toBe(false))
	})
})

describe('video server model', () => {
	it('has no GPI actions, as video servers have no GPIs', () => {
		expect(harness('videoserver').ids()).not.toContain('gpi')
		expect(harness('videoserver').ids()).not.toContain('gpiByName')
		expect(harness('carbonite').ids()).toContain('gpi')
	})
})

describe('presets', () => {
	it.each<Model>(['carbonite', 'acuity', 'ultrix', 'opengear', 'videoserver'])(
		'%s only presets actions it defines',
		(model) => {
			const ids = new Set(harness(model).ids())
			const { presets } = GetPresets(model)
			const presetActionIds = Object.values(presets).flatMap((preset) =>
				preset && preset.type === 'simple' ? preset.steps.flatMap((step) => step.down.map((a) => a.actionId)) : [],
			)

			expect(presetActionIds.length).toBeGreaterThan(0)
			for (const id of presetActionIds) expect(ids).toContain(id)
		},
	)
})
