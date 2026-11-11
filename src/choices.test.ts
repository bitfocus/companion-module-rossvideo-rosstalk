import { describe, expect, it } from 'vitest'
import { VIDEO_SOURCE_CHOICES } from './choices.js'

describe('carbonite video sources', () => {
	it('uses the documented scene source ids', () => {
		const ids = VIDEO_SOURCE_CHOICES.map((choice) => choice.id)
		expect(ids).toContain('SCN:1')
		expect(ids).toContain('SCNA:1')
		expect(ids.some((id) => id.startsWith('SNC'))).toBe(false)
	})
})
