import { updateQuizRatingSummary } from './quiz-rating-summary.utils'

describe('quiz-rating-summary.utils', () => {
  const baseSummary = () => ({
    count: 0,
    avg: 0,
    stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } as Record<
      '1' | '2' | '3' | '4' | '5',
      number
    >,
    updated: undefined as Date | undefined,
  })

  describe(updateQuizRatingSummary.name, () => {
    const fixedNow = new Date('2026-01-10T12:00:00.000Z')

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(fixedNow)
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    describe('no-op path (stars unchanged)', () => {
      it('returns the same bucket distribution and count/avg, but updates `updated`', () => {
        const summary = {
          ...baseSummary(),
          count: 3,
          avg: 3.7,
          stars: { '1': 0, '2': 0, '3': 1, '4': 1, '5': 1 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 4,
          nextStars: 4,
          updatedAt: fixedNow,
        })

        expect(result).toEqual({
          ...summary,
          updated: fixedNow,
        })

        expect(result.stars).toBe(summary.stars)
      })

      it('treats `previousStars` and `nextStars` as clamped; still no-op when they clamp to same value', () => {
        const summary = {
          ...baseSummary(),
          count: 10,
          avg: 4.2,
          stars: { '1': 0, '2': 1, '3': 1, '4': 2, '5': 6 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 999, // clamps to 5
          nextStars: 5,
        })

        expect(result).toEqual({
          ...summary,
          updated: fixedNow,
        })
      })

      it('uses provided updatedAt over system time', () => {
        const summary = {
          ...baseSummary(),
          count: 1,
          avg: 5,
          stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 1 },
        }
        const updatedAt = new Date('2026-01-10T12:34:56.000Z')

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 5,
          nextStars: 5,
          updatedAt,
        })

        expect(result.updated).toEqual(updatedAt)
      })
    })

    describe('create path (previousStars undefined)', () => {
      it('increments count and the correct bucket, recomputes avg (simple)', () => {
        const summary = baseSummary()

        const result = updateQuizRatingSummary({
          summary,
          previousStars: undefined,
          nextStars: 4,
        })

        expect(result).toEqual({
          count: 1,
          avg: 4,
          stars: { '1': 0, '2': 0, '3': 0, '4': 1, '5': 0 },
          updated: fixedNow,
        })
      })

      it('clamps nextStars below 1 to 1', () => {
        const summary = baseSummary()

        const result = updateQuizRatingSummary({
          summary,
          previousStars: undefined,
          nextStars: -100,
        })

        expect(result).toEqual({
          count: 1,
          avg: 1,
          stars: { '1': 1, '2': 0, '3': 0, '4': 0, '5': 0 },
          updated: fixedNow,
        })
      })

      it('clamps nextStars above 5 to 5', () => {
        const summary = baseSummary()

        const result = updateQuizRatingSummary({
          summary,
          previousStars: undefined,
          nextStars: 999,
        })

        expect(result).toEqual({
          count: 1,
          avg: 5,
          stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 1 },
          updated: fixedNow,
        })
      })

      it('handles missing `count` gracefully (treats as 0)', () => {
        const summary = {
          ...baseSummary(),
          count: undefined as unknown as number,
        }

        const result = updateQuizRatingSummary({
          summary: summary as any,
          previousStars: undefined,
          nextStars: 3,
        })

        expect(result.count).toBe(1)
        expect(result.avg).toBe(3)
        expect(result.stars).toEqual({
          '1': 0,
          '2': 0,
          '3': 1,
          '4': 0,
          '5': 0,
        })
        expect(result.updated).toEqual(fixedNow)
      })

      it('computes a stable one-decimal avg from buckets', () => {
        const summary = {
          ...baseSummary(),
          count: 2,
          avg: 0,
          stars: { '1': 0, '2': 0, '3': 1, '4': 0, '5': 1 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: undefined,
          nextStars: 4,
        })
        // buckets become: 3:1, 4:1, 5:1 => avg = (3+4+5)/3 = 4.0
        expect(result.avg).toBe(4.0)
        expect(result.count).toBe(3)
      })
    })

    describe('update path (previousStars defined)', () => {
      it('moves one rating between buckets, keeps count unchanged, recomputes avg', () => {
        const summary = {
          ...baseSummary(),
          count: 10,
          avg: 3.5,
          stars: { '1': 1, '2': 2, '3': 3, '4': 2, '5': 2 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 5,
          nextStars: 2,
        })

        expect(result).toEqual({
          count: 10,
          avg: 2.9,
          stars: { '1': 1, '2': 3, '3': 3, '4': 2, '5': 1 },
          updated: fixedNow,
        })
      })

      it('clamps previousStars and nextStars before moving buckets', () => {
        const summary = {
          ...baseSummary(),
          count: 2,
          avg: 0,
          stars: { '1': 1, '2': 0, '3': 0, '4': 0, '5': 1 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 999, // clamps to 5
          nextStars: -10, // clamps to 1
        })

        // move one from 5 -> 1
        expect(result.stars).toEqual({ '1': 2, '2': 0, '3': 0, '4': 0, '5': 0 })
        expect(result.count).toBe(2)
        expect(result.avg).toBe(1.0)
        expect(result.updated).toEqual(fixedNow)
      })

      it('does not allow bucket counts to go below 0', () => {
        const summary = {
          ...baseSummary(),
          count: 0,
          avg: 0,
          stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 5, // bucket is 0, so decrement would underflow without clamp
          nextStars: 1,
        })

        expect(result.stars['5']).toBe(0)
        expect(result.stars['1']).toBe(1)
        expect(result.avg).toBe(1)
      })

      it('keeps avg at 0 when buckets sum to 0 (defensive)', () => {
        const summary = {
          ...baseSummary(),
          count: 0,
          avg: 0,
          stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 3,
          nextStars: 4,
        })

        expect(result.count).toBe(1)
        expect(result.stars).toEqual({ '1': 0, '2': 0, '3': 0, '4': 1, '5': 0 })
        expect(result.avg).toBe(4)
      })

      it('uses provided updatedAt over system time', () => {
        const summary = {
          ...baseSummary(),
          count: 3,
          avg: 3,
          stars: { '1': 0, '2': 1, '3': 1, '4': 1, '5': 0 },
        }
        const updatedAt = new Date('2026-01-10T13:00:00.000Z')

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 2,
          nextStars: 5,
          updatedAt,
        })

        expect(result.updated).toEqual(updatedAt)
      })

      it('does not mutate the input summary object', () => {
        const summary = {
          ...baseSummary(),
          count: 4,
          avg: 2.5,
          stars: { '1': 1, '2': 1, '3': 1, '4': 1, '5': 0 },
        }

        const snapshot = JSON.parse(JSON.stringify(summary))

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 1,
          nextStars: 5,
        })

        expect(summary).toEqual(snapshot)
        expect(result.stars).not.toBe(summary.stars)
      })
    })
  })
})
