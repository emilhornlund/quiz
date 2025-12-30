import { GameEventType, GameStatus } from '@klurigo/common'

import { buildGameQuitEvent } from './game-quit-event.utils'

describe('Game Quit Event Utils', () => {
  describe('buildGameQuitEvent', () => {
    it('should return quit event with Active status', () => {
      const result = buildGameQuitEvent(GameStatus.Active)

      expect(result.type).toBe(GameEventType.GameQuitEvent)
      expect(result.status).toBe(GameStatus.Active)
    })

    it('should return quit event with Completed status', () => {
      const result = buildGameQuitEvent(GameStatus.Completed)

      expect(result.type).toBe(GameEventType.GameQuitEvent)
      expect(result.status).toBe(GameStatus.Completed)
    })

    it('should return quit event with Expired status', () => {
      const result = buildGameQuitEvent(GameStatus.Expired)

      expect(result.type).toBe(GameEventType.GameQuitEvent)
      expect(result.status).toBe(GameStatus.Expired)
    })

    it('should return consistent event structure for all statuses', () => {
      const statuses = Object.values(GameStatus)

      statuses.forEach((status) => {
        const result = buildGameQuitEvent(status)

        expect(result).toHaveProperty('type', GameEventType.GameQuitEvent)
        expect(result).toHaveProperty('status', status)
        expect(Object.keys(result)).toEqual(['type', 'status'])
      })
    })

    it('should handle multiple calls without side effects', () => {
      const results = Array.from({ length: 10 }, () =>
        buildGameQuitEvent(GameStatus.Active),
      )

      results.forEach((result) => {
        expect(result.type).toBe(GameEventType.GameQuitEvent)
        expect(result.status).toBe(GameStatus.Active)
        expect(Object.keys(result)).toEqual(['type', 'status'])
      })

      expect(results[0]).toEqual(results[9])
    })

    it('should create unique objects for each call', () => {
      const result1 = buildGameQuitEvent(GameStatus.Active)
      const result2 = buildGameQuitEvent(GameStatus.Active)

      expect(result1).not.toBe(result2)
      expect(result1).toEqual(result2)
    })

    it('should handle all enum values correctly', () => {
      const testCases = [
        { status: GameStatus.Active, expected: GameStatus.Active },
        { status: GameStatus.Completed, expected: GameStatus.Completed },
        { status: GameStatus.Expired, expected: GameStatus.Expired },
      ]

      testCases.forEach(({ status, expected }) => {
        const result = buildGameQuitEvent(status)
        expect(result.status).toBe(expected)
      })
    })

    it('should maintain type safety', () => {
      const result = buildGameQuitEvent(GameStatus.Active)

      expect(result.type).toBe(GameEventType.GameQuitEvent)
      expect(typeof result.type).toBe('string')
      expect(typeof result.status).toBe('string')
    })

    it('should handle rapid successive calls', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const promises = Array.from({ length: 100 }, (_, i) =>
        Promise.resolve(buildGameQuitEvent(GameStatus.Active)),
      )

      return Promise.all(promises).then((results) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        results.forEach((result, index) => {
          expect(result.type).toBe(GameEventType.GameQuitEvent)
          expect(result.status).toBe(GameStatus.Active)
          expect(Object.keys(result)).toEqual(['type', 'status'])
        })

        // Ensure all results are equal but not the same reference
        expect(results[0]).toEqual(results[99])
        expect(results[0]).not.toBe(results[99])
      })
    })
  })
})
