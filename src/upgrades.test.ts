import type { CompanionMigrationAction, CompanionUpgradeContext } from '@companion-module/base'
import { describe, expect, it } from 'vitest'
import type { ModuleConfig } from './config.js'
import {
	acuityKeyerMleUpgrade,
	fixupVariablesToExpression,
	numericFieldsUpgrade,
	textToDropdownsUpgrade,
	UpgradeScripts,
} from './upgrades.js'

const context = {} as CompanionUpgradeContext<ModuleConfig>

function action(actionId: string, options: CompanionMigrationAction['options']): CompanionMigrationAction {
	return { id: 'a', controlId: 'c', actionId, options }
}

describe('numericFieldsUpgrade', () => {
	it('converts numeric strings and variables in numeric options', () => {
		const result = numericFieldsUpgrade(context, {
			config: null,
			secrets: null,
			actions: [
				action('cc', {
					bank: { isExpression: false, value: '2' },
					cc: { isExpression: false, value: '$(internal:x)' },
				}),
				action('custom', { cmd: { isExpression: false, value: '5' } }),
			],
			feedbacks: [],
		})

		expect(result.updatedActions).toHaveLength(1)
		expect(result.updatedActions[0].options).toEqual({
			bank: { isExpression: false, value: 2 },
			cc: { isExpression: true, value: '$(internal:x)' },
		})
	})

	it('converts a string port to a number', () => {
		const config = { model: 'carbonite', host: '1.2.3.4', port: '7789', keepAlive: false } as unknown as ModuleConfig
		const result = numericFieldsUpgrade(context, { config, secrets: null, actions: [], feedbacks: [] })

		expect(result.updatedConfig?.port).toBe(7789)
	})

	it('falls back to the default port when empty', () => {
		const config = { model: 'carbonite', host: '1.2.3.4', port: '', keepAlive: false } as unknown as ModuleConfig
		const result = numericFieldsUpgrade(context, { config, secrets: null, actions: [], feedbacks: [] })

		expect(result.updatedConfig?.port).toBe(7788)
	})
})

describe('fixupVariablesToExpression', () => {
	it('leaves plain values alone', () => {
		expect(fixupVariablesToExpression({ isExpression: false, value: 'IN:5' })).toEqual({
			isExpression: false,
			value: 'IN:5',
		})
	})

	it('turns a lone variable into an expression', () => {
		expect(fixupVariablesToExpression({ isExpression: false, value: '$(internal:src)' })).toEqual({
			isExpression: true,
			value: '$(internal:src)',
		})
	})

	it('wraps mixed text in parseVariables', () => {
		expect(fixupVariablesToExpression({ isExpression: false, value: 'IN:$(internal:n)' })).toEqual({
			isExpression: true,
			value: 'parseVariables("IN:$(internal:n)")',
		})
	})
})

describe('textToDropdownsUpgrade', () => {
	it('adds the MultiViewer type to MVBOX actions', () => {
		const result = textToDropdownsUpgrade(context, {
			config: null,
			secrets: null,
			actions: [action('MVBOX', { vidSource: { isExpression: false, value: 'IN:5' } })],
			feedbacks: [],
		})

		expect(result.updatedActions[0].options.mvType).toEqual({ isExpression: false, value: 'VP' })
	})
})

describe('acuityKeyerMleUpgrade', () => {
	const config = (model: ModuleConfig['model']): ModuleConfig => ({ model, host: '', port: 7788, keepAlive: false })
	const keyer = () => action('transKey', { mle: { isExpression: false, value: 'ME:2' } })

	it('strips the ME prefix for acuity', () => {
		const result = acuityKeyerMleUpgrade(context, {
			config: config('acuity'),
			secrets: null,
			actions: [keyer()],
			feedbacks: [],
		})
		expect(result.updatedActions[0].options.mle).toEqual({ isExpression: false, value: '2' })
	})

	it('leaves other models alone', () => {
		const result = acuityKeyerMleUpgrade(context, {
			config: config('carbonite'),
			secrets: null,
			actions: [keyer()],
			feedbacks: [],
		})
		expect(result.updatedActions).toHaveLength(0)
	})

	it('strips the prefix from imported keyers without a direction when there is no config', () => {
		const withDirection = action('transKey', {
			mle: { isExpression: false, value: 'ME:1' },
			transD: { isExpression: false, value: 'TOGGLE' },
		})
		const result = acuityKeyerMleUpgrade(context, {
			config: null,
			secrets: null,
			actions: [keyer(), withDirection],
			feedbacks: [],
		})
		expect(result.updatedActions).toHaveLength(1)
		expect(result.updatedActions[0].options.mle).toEqual({ isExpression: false, value: '2' })
		expect(withDirection.options.mle).toEqual({ isExpression: false, value: 'ME:1' })
	})

	it('strips the prefix from a variable MLE before it becomes an expression', () => {
		const props = {
			config: config('acuity'),
			secrets: null,
			actions: [action('transKey', { mle: { isExpression: false, value: 'ME:$(internal:me)' } })],
			feedbacks: [],
		}
		const acuityIndex = UpgradeScripts.indexOf(acuityKeyerMleUpgrade)
		expect(acuityIndex).toBeLessThan(UpgradeScripts.indexOf(textToDropdownsUpgrade))

		acuityKeyerMleUpgrade(context, props)
		textToDropdownsUpgrade(context, props)
		expect(props.actions[0].options.mle).toEqual({ isExpression: true, value: '$(internal:me)' })
	})
})
