import { describe, expect, it } from 'vitest'
import type { Model } from '../config.js'
import type RossTalkInstance from '../main.js'
import { GetPresets } from '../presets.js'
import { GetActionDefinitions } from './index.js'

const self = {} as RossTalkInstance

function actionIds(model: Model): string[] {
	return Object.entries(GetActionDefinitions(self, model))
		.filter(([, definition]) => definition)
		.map(([id]) => id)
}

describe('video server model', () => {
	it('has no GPI actions, as video servers have no GPIs', () => {
		expect(actionIds('videoserver')).not.toContain('gpi')
		expect(actionIds('videoserver')).not.toContain('gpiByName')
		expect(actionIds('carbonite')).toContain('gpi')
	})

	it('only presets actions it defines', () => {
		const ids = new Set(actionIds('videoserver'))
		const { presets } = GetPresets('videoserver')
		const presetActionIds = Object.values(presets).flatMap((preset) =>
			preset && preset.type === 'simple' ? preset.steps.flatMap((step) => step.down.map((a) => a.actionId)) : [],
		)

		expect(presetActionIds.length).toBeGreaterThan(0)
		for (const id of presetActionIds) expect(ids).toContain(id)
	})
})
