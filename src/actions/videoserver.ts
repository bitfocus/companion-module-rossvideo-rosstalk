import {
	serverAngleCommand,
	serverCueCommand,
	serverEjectCommand,
	serverGotoCommand,
	serverJogCommand,
	serverLoopCommand,
	serverPlayCommand,
	serverStopCommand,
	type ServerLoopMode,
} from '../commands.js'
import { expressionDropdownField, numberField, textField, videoField } from './fields.js'
import type { ModelActions } from './index.js'
import type { SharedActions } from './shared.js'

const CHANNELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((channel) => ({
	id: channel,
	label: `Channel ${channel}`,
}))

const RE_TIMECODE = '/^[0-9]{2},[0-9]{2},[0-9]{2},[0-9]{2}$/'
const RE_OPTIONAL_TIMECODE = '/^$|^[0-9]{2},[0-9]{2},[0-9]{2},[0-9]{2}$/'

const channelField = videoField('channel', 'Channel', 'A', CHANNELS)

const clipField = (defaultValue: string, tooltip: string) => textField('clip', 'Clip', defaultValue, { tooltip })

const CLIP_TOOLTIP = 'Path relative to H:\\video\\, e.g. \\news\\crime-report for a clip in a subdirectory'

const startTimecodeField = textField('timecode', 'Start timecode', '', {
	regex: RE_OPTIONAL_TIMECODE,
	tooltip: 'Optional, as hh,mm,ss,ff, e.g. 00,00,15,00. Leave empty to start from the beginning.',
})

export function VideoServerActions(shared: SharedActions): ModelActions {
	const { send } = shared

	return {
		serverCue: {
			name: 'Cue clip',
			options: [channelField, clipField('', CLIP_TOOLTIP), startTimecodeField],
			callback: (event) => {
				if (event.options.clip)
					send(serverCueCommand(event.options.channel, event.options.clip, event.options.timecode))
			},
		},
		serverPlay: {
			name: 'Play',
			description: 'Plays the loaded clip, or loads and plays a clip if one is given',
			options: [
				channelField,
				clipField('', `Optional. ${CLIP_TOOLTIP}. Leave empty to play the clip already loaded.`),
				{ ...startTimecodeField, tooltip: `${startTimecodeField.tooltip} Only used when a clip is given.` },
			],
			callback: (event) => send(serverPlayCommand(event.options.channel, event.options.clip, event.options.timecode)),
		},
		serverStop: {
			name: 'Stop',
			options: [channelField],
			callback: (event) => send(serverStopCommand(event.options.channel)),
		},
		serverEject: {
			name: 'Eject',
			description: 'Unloads the clip from the channel',
			options: [channelField],
			callback: (event) => send(serverEjectCommand(event.options.channel)),
		},
		serverGoto: {
			name: 'Go to timecode',
			options: [
				channelField,
				textField('timecode', 'Timecode', '00,00,00,00', { regex: RE_TIMECODE, tooltip: 'hh,mm,ss,ff' }),
			],
			callback: (event) => send(serverGotoCommand(event.options.channel, event.options.timecode)),
		},
		serverJog: {
			name: 'Jog',
			options: [
				channelField,
				{ ...numberField('frames', 'Frames', 1, -9999), tooltip: 'Negative values jog backwards' },
			],
			callback: (event) => send(serverJogCommand(event.options.channel, event.options.frames)),
		},
		serverLoop: {
			name: 'Loop mode',
			options: [
				channelField,
				expressionDropdownField<'mode', ServerLoopMode>('mode', 'Mode', 'loop', [
					{ id: 'off', label: 'Off' },
					{ id: 'loop', label: 'Loop' },
					{ id: 'loop-to', label: 'Loop to' },
					{ id: 'ping-pong', label: 'Ping-pong' },
					{ id: 'ping-pong-to', label: 'Ping-pong to' },
				]),
			],
			callback: (event) => send(serverLoopCommand(event.options.channel, event.options.mode)),
		},
		serverAngle: {
			name: 'Camera angle',
			description: 'Selects the camera angle to play out from an ISO clip',
			options: [channelField, numberField('angle', 'Angle', 1, 1)],
			callback: (event) => send(serverAngleCommand(event.options.channel, event.options.angle)),
		},
	}
}
