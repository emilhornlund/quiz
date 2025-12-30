import { GameEventType } from '@klurigo/common'

import { buildGameLoadingEvent } from './game-loading-event.utils'

describe('Game Loading Event Utils', () => {
  describe('buildGameLoadingEvent', () => {
    it('should return loading event with correct type', () => {
      const result = buildGameLoadingEvent()

      expect(result.type).toBe(GameEventType.GameLoading)
    })

    it('should return consistent event structure', () => {
      const result1 = buildGameLoadingEvent()
      const result2 = buildGameLoadingEvent()

      expect(result1).toEqual(result2)
      expect(result1.type).toBe(GameEventType.GameLoading)
      expect(Object.keys(result1)).toEqual(['type'])
    })

    it('should return plain object without additional properties', () => {
      const result = buildGameLoadingEvent()

      expect(result).not.toHaveProperty('game')
      expect(result).not.toHaveProperty('player')
      expect(result).not.toHaveProperty('data')
      expect(result).not.toHaveProperty('metadata')
    })

    it('should work multiple times without side effects', () => {
      const results = Array.from({ length: 100 }, () => buildGameLoadingEvent())

      results.forEach((result) => {
        expect(result.type).toBe(GameEventType.GameLoading)
        expect(Object.keys(result)).toEqual(['type'])
      })

      expect(results[0]).toEqual(results[99])
    })

    it('should return a plain object (not class instance)', () => {
      const result = buildGameLoadingEvent()

      expect(result.constructor).toBe(Object)
      expect(typeof result).toBe('object')
      expect(Array.isArray(result)).toBe(false)
    })

    it('should be immutable when returned', () => {
      const result = buildGameLoadingEvent()
      const originalType = result.type

      // Attempt to modify the returned object
      try {
        ;(result as { type: string }).type = 'modified'
        // If modification succeeds, ensure it doesn't affect new calls
        const newResult = buildGameLoadingEvent()
        expect(newResult.type).toBe(GameEventType.GameLoading)
      } finally {
        // Restore original state for this test
        ;(result as { type: string }).type = originalType
      }
    })

    it('should have exact GameLoadingEvent interface shape', () => {
      const result = buildGameLoadingEvent()

      // TypeScript interface compliance checks
      expect(result).toHaveProperty('type')
      expect(typeof result.type).toBe('string')
      expect(Object.keys(result)).toHaveLength(1)
      expect(Object.getOwnPropertyNames(result)).toEqual(['type'])
    })

    it('should be serializable to JSON', () => {
      const result = buildGameLoadingEvent()
      const jsonString = JSON.stringify(result)
      const parsed = JSON.parse(jsonString)

      expect(parsed).toEqual(result)
      expect(parsed.type).toBe(GameEventType.GameLoading)
    })

    it('should handle concurrent calls safely', async () => {
      const promises = Array.from({ length: 50 }, () =>
        Promise.resolve(buildGameLoadingEvent()),
      )

      const results = await Promise.all(promises)

      results.forEach((result) => {
        expect(result.type).toBe(GameEventType.GameLoading)
        expect(Object.keys(result)).toEqual(['type'])
      })

      // All results should be identical
      const firstResult = results[0]
      results.forEach((result) => {
        expect(result).toEqual(firstResult)
      })
    })
  })
})
