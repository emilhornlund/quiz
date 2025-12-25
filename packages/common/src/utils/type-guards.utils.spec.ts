import { describe, expect, it } from 'vitest'

import { isDefined } from './type-guards.utils'

describe('type-guards', () => {
  describe('isDefined', () => {
    it('returns false for undefined', () => {
      expect(isDefined(undefined)).toBe(false)
    })

    it('returns false for null', () => {
      expect(isDefined(null)).toBe(false)
    })

    it('returns true for falsy non-null values', () => {
      expect(isDefined(false)).toBe(true)
      expect(isDefined(0)).toBe(true)
      expect(isDefined('')).toBe(true)
      expect(isDefined(NaN)).toBe(true)
    })

    it('returns true for objects and arrays', () => {
      expect(isDefined({})).toBe(true)
      expect(isDefined([])).toBe(true)
    })

    it('returns true for functions', () => {
      const fn = () => undefined
      expect(isDefined(fn)).toBe(true)
    })

    it('works well with Array.filter at runtime', () => {
      const input = [1, undefined, 2, null, 3]
      const output = input.filter(isDefined)
      expect(output).toEqual([1, 2, 3])
    })
  })
})
