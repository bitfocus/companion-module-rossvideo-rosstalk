import { describe, expect, it } from 'vitest'
import { RE_MEMORY } from './carbonite.js'

function matches(regex: string, value: string): boolean {
	return new RegExp(regex.slice(1, -1)).test(value)
}

describe('carbonite memory regex', () => {
	it('accepts the documented examples', () => {
		expect(matches(RE_MEMORY, '19:ME:2:MME:1:CK:1')).toBe(true)
		expect(matches(RE_MEMORY, '25:ME:1:MME:3')).toBe(true)
		expect(matches(RE_MEMORY, '11:ME:P/P')).toBe(true)
	})

	it('rejects values without an ME or chroma key', () => {
		expect(matches(RE_MEMORY, '19')).toBe(false)
		expect(matches(RE_MEMORY, '19:CK')).toBe(false)
	})
})
