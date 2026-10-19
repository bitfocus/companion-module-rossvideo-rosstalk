import { describe, expect, it } from 'vitest'
import { ACUITY_LOCATIONS, dropdownField, onOffField, transitionDirectionField, transitionTypeField } from './fields.js'

describe('dropdown expressions', () => {
	it('allows expressions on choices buttons change at runtime', () => {
		for (const field of [onOffField('state', 'State'), transitionTypeField, transitionDirectionField]) {
			expect(field.disableAutoExpression).toBeUndefined()
		}
	})

	it('keeps setup choices fixed', () => {
		expect(dropdownField('location', 'Location', 'USB', ACUITY_LOCATIONS).disableAutoExpression).toBe(true)
	})
})
