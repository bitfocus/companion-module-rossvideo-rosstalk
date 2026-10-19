import {
	InstanceBase,
	InstanceStatus,
	TCPHelper,
	type InstanceTypes,
	type SomeCompanionConfigField,
} from '@companion-module/base'
import { GetActionDefinitions, type RossTalkActions } from './actions/index.js'
import { noopCommand } from './commands.js'
import { DEFAULT_PORT, GetConfigFields, type ModuleConfig } from './config.js'
import { GetPresets } from './presets.js'

export { UpgradeScripts } from './upgrades.js'

const NOOP_INTERVAL_MS = 30_000
const CONNECT_TIMEOUT_MS = 2_000

export interface RossTalkTypes extends InstanceTypes {
	config: ModuleConfig
	actions: RossTalkActions
}

export default class RossTalkInstance extends InstanceBase<RossTalkTypes> {
	config!: ModuleConfig
	socket: TCPHelper | undefined
	private pendingCommands: string[] = []
	private noopTimer: NodeJS.Timeout | undefined
	private connectTimer: NodeJS.Timeout | undefined

	async init(config: ModuleConfig): Promise<void> {
		this.updateStatus(InstanceStatus.Connecting, 'Waiting To Connect')
		await this.configUpdated(config)
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.setActionDefinitions(GetActionDefinitions(this, config.model))
		const { structure, presets } = GetPresets(config.model)
		this.setPresetDefinitions(structure, presets)

		this.pendingCommands = []
		this.destroySocket()

		if (!this.config.host) {
			this.updateStatus(InstanceStatus.BadConfig, 'No host configured')
		} else if (this.config.keepAlive) {
			this.openSocket()
			this.startNoopTimer()
		} else {
			// Without keep-alive there is no connection to report on until the first command is sent
			this.updateStatus(InstanceStatus.Ok, 'Connects per command')
		}
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	sendCommand(cmd: string): void {
		if (!this.config.host) {
			this.log('warn', `No host configured, dropping command: ${cmd}`)
			return
		}

		if (this.config.keepAlive) {
			if (this.socket?.isConnected) {
				this.log('debug', `sending tcp ${cmd} to ${this.config.host}`)
				this.socket.send(cmd + '\r\n')
			} else {
				this.log('warn', `Socket not connected, dropping command: ${cmd}`)
			}
			return
		}

		// Commands issued while a per-command connection is still opening share it, rather than
		// each tearing down the previous socket before its command was sent
		this.pendingCommands.push(cmd)
		if (!this.socket) this.openSocket()
	}

	private openSocket(): void {
		this.log('debug', 'Opening socket.')

		const socket = new TCPHelper(this.config.host, this.config.port || DEFAULT_PORT)
		this.socket = socket

		socket.on('status_change', (status, message) => {
			if (status !== InstanceStatus.UnknownError) {
				this.updateStatus(status, message)
			}
		})

		socket.on('error', (err) => {
			this.log('error', 'Network error: ' + err.message)
			this.updateStatus(InstanceStatus.ConnectionFailure, (err as NodeJS.ErrnoException).code ?? err.message)

			// TCPHelper would retry, but replaying one-shot commands late could fire them at the wrong moment
			if (!this.config.keepAlive && this.socket === socket) this.abandonSocket()
		})

		socket.on('connect', () => {
			this.updateStatus(InstanceStatus.Ok)
			this.log('debug', 'Connected')
			if (!this.config.keepAlive) void this.flushAndClose(socket)
		})

		if (!this.config.keepAlive) {
			this.connectTimer = setTimeout(() => {
				if (this.socket !== socket || socket.isConnected) return
				this.log('error', `Timed out connecting to ${this.config.host}`)
				this.updateStatus(InstanceStatus.ConnectionFailure, 'Connection timed out')
				this.abandonSocket()
			}, CONNECT_TIMEOUT_MS)
		}
	}

	private abandonSocket(): void {
		if (this.pendingCommands.length > 0) {
			this.log('warn', `Dropping ${this.pendingCommands.length} unsent command(s)`)
		}
		this.pendingCommands = []
		this.destroySocket()
	}

	private async flushAndClose(socket: TCPHelper): Promise<void> {
		while (this.socket === socket && this.pendingCommands.length > 0) {
			const cmd = this.pendingCommands.shift()!
			this.log('debug', `sending tcp ${cmd} to ${this.config.host}`)
			try {
				if (!(await socket.sendAsync(cmd + '\r\n'))) {
					this.log('warn', `Connection lost, dropping command: ${cmd}`)
					if (this.socket === socket) this.abandonSocket()
					return
				}
			} catch (e) {
				this.log('error', `Failed to send ${cmd}: ${e instanceof Error ? e.message : String(e)}`)
			}
		}

		if (this.socket === socket) {
			this.log('debug', 'Closing socket.')
			this.destroySocket()
		}
	}

	/** Carbonite documents NOOP for holding an idle RossTalk connection open */
	private startNoopTimer(): void {
		this.stopNoopTimer()
		if (!this.config.keepAlive || this.config.model !== 'carbonite') return

		this.noopTimer = setInterval(() => {
			if (this.socket?.isConnected) this.socket.send(noopCommand() + '\r\n')
		}, NOOP_INTERVAL_MS)
	}

	private stopNoopTimer(): void {
		if (this.noopTimer) clearInterval(this.noopTimer)
		this.noopTimer = undefined
	}

	private destroySocket(): void {
		this.stopNoopTimer()
		if (this.connectTimer) clearTimeout(this.connectTimer)
		this.connectTimer = undefined
		this.socket?.destroy()
		this.socket = undefined
	}

	async destroy(): Promise<void> {
		this.pendingCommands = []
		this.destroySocket()
		this.log('debug', 'destroy ' + this.id)
	}
}
