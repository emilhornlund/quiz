import { updateQuizRatingSummary } from './quiz-rating-summary.utils'

describe('quiz-rating-summary.utils', () => {
  const baseSummary = () => ({
    count: 0,
    avg: 0,
    stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } as Record<
      '1' | '2' | '3' | '4' | '5',
      number
    >,
    commentCount: 0,
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

    describe('no-op path (stars + comment presence unchanged)', () => {
      it('returns the same bucket distribution and count/avg/commentCount, but updates `updated`', () => {
        const summary = {
          ...baseSummary(),
          count: 3,
          avg: 3.7,
          commentCount: 2,
          stars: { '1': 0, '2': 0, '3': 1, '4': 1, '5': 1 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 4,
          nextStars: 4,
          previousComment: 'hello',
          nextComment: 'changed but still present',
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
          commentCount: 1,
          stars: { '1': 0, '2': 1, '3': 1, '4': 2, '5': 6 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 999, // clamps to 5
          nextStars: 5,
          previousComment: null,
          nextComment: '  ', // absent -> absent (trimmed)
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
          commentCount: 0,
          stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 1 },
        }
        const updatedAt = new Date('2026-01-10T12:34:56.000Z')

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 5,
          nextStars: 5,
          previousComment: undefined,
          nextComment: undefined,
          updatedAt,
        })

        expect(result.updated).toEqual(updatedAt)
      })
    })

    describe('commentCount-only changes (stars unchanged, comment presence toggles)', () => {
      it('increments commentCount when a comment is added (absent -> present)', () => {
        const summary = {
          ...baseSummary(),
          count: 1,
          avg: 4,
          commentCount: 0,
          stars: { '1': 0, '2': 0, '3': 0, '4': 1, '5': 0 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 4,
          nextStars: 4,
          previousComment: undefined,
          nextComment: 'Nice quiz',
        })

        expect(result).toEqual({
          ...summary,
          commentCount: 1,
          updated: fixedNow,
        })
        expect(result.stars).not.toBe(summary.stars)
      })

      it('decrements commentCount when a comment is removed (present -> absent)', () => {
        const summary = {
          ...baseSummary(),
          count: 2,
          avg: 4.5,
          commentCount: 2,
          stars: { '1': 0, '2': 0, '3': 0, '4': 1, '5': 1 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 5,
          nextStars: 5,
          previousComment: 'Great',
          nextComment: '   ',
        })

        expect(result).toEqual({
          ...summary,
          commentCount: 1,
          updated: fixedNow,
        })
      })

      it('does not underflow commentCount below 0 (defensive)', () => {
        const summary = {
          ...baseSummary(),
          count: 1,
          avg: 1,
          commentCount: 0,
          stars: { '1': 1, '2': 0, '3': 0, '4': 0, '5': 0 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 1,
          nextStars: 1,
          previousComment: 'had comment',
          nextComment: null,
        })

        expect(result.commentCount).toBe(0)
      })
    })

    describe('create path (previousStars undefined)', () => {
      it('increments count and the correct bucket, recomputes avg (simple) and preserves commentCount when no comment change provided', () => {
        const summary = baseSummary()

        const result = updateQuizRatingSummary({
          summary,
          previousStars: undefined,
          nextStars: 4,
          previousComment: undefined,
          nextComment: undefined,
        })

        expect(result).toEqual({
          count: 1,
          avg: 4,
          stars: { '1': 0, '2': 0, '3': 0, '4': 1, '5': 0 },
          commentCount: 0,
          updated: fixedNow,
        })
      })

      it('increments commentCount when creating a rating with a non-empty comment', () => {
        const summary = baseSummary()

        const result = updateQuizRatingSummary({
          summary,
          previousStars: undefined,
          nextStars: 4,
          previousComment: undefined,
          nextComment: 'Fun!',
        })

        expect(result.commentCount).toBe(1)
        expect(result.count).toBe(1)
        expect(result.avg).toBe(4)
        expect(result.stars).toEqual({ '1': 0, '2': 0, '3': 0, '4': 1, '5': 0 })
      })

      it('does not increment commentCount when creating a rating with whitespace-only comment', () => {
        const summary = baseSummary()

        const result = updateQuizRatingSummary({
          summary,
          previousStars: undefined,
          nextStars: 4,
          previousComment: undefined,
          nextComment: '   ',
        })

        expect(result.commentCount).toBe(0)
        expect(result.count).toBe(1)
      })

      it('clamps nextStars below 1 to 1', () => {
        const summary = baseSummary()

        const result = updateQuizRatingSummary({
          summary,
          previousStars: undefined,
          nextStars: -100,
          previousComment: undefined,
          nextComment: undefined,
        })

        expect(result).toEqual({
          count: 1,
          avg: 1,
          stars: { '1': 1, '2': 0, '3': 0, '4': 0, '5': 0 },
          commentCount: 0,
          updated: fixedNow,
        })
      })

      it('clamps nextStars above 5 to 5', () => {
        const summary = baseSummary()

        const result = updateQuizRatingSummary({
          summary,
          previousStars: undefined,
          nextStars: 999,
          previousComment: undefined,
          nextComment: undefined,
        })

        expect(result).toEqual({
          count: 1,
          avg: 5,
          stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 1 },
          commentCount: 0,
          updated: fixedNow,
        })
      })

      it('recomputes `count` from buckets and ignores `summary.count`', () => {
        const summary = {
          ...baseSummary(),
          count: 999,
          avg: 0,
          stars: { '1': 0, '2': 0, '3': 1, '4': 0, '5': 0 },
          commentCount: 0,
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: undefined,
          nextStars: 5,
          previousComment: undefined,
          nextComment: undefined,
        })

        expect(result.count).toBe(2)
        expect(result.stars).toEqual({ '1': 0, '2': 0, '3': 1, '4': 0, '5': 1 })
      })

      it('computes a stable one-decimal avg from buckets', () => {
        const summary = {
          ...baseSummary(),
          count: 2,
          avg: 0,
          commentCount: 0,
          stars: { '1': 0, '2': 0, '3': 1, '4': 0, '5': 1 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: undefined,
          nextStars: 4,
          previousComment: undefined,
          nextComment: undefined,
        })

        expect(result.avg).toBe(4.0)
        expect(result.count).toBe(3)
        expect(result.commentCount).toBe(0)
      })
    })

    describe('update path (previousStars defined)', () => {
      it('moves one rating between buckets, keeps count unchanged, recomputes avg', () => {
        const summary = {
          ...baseSummary(),
          count: 10,
          avg: 3.5,
          commentCount: 4,
          stars: { '1': 1, '2': 2, '3': 3, '4': 2, '5': 2 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 5,
          nextStars: 2,
          previousComment: undefined,
          nextComment: undefined,
        })

        expect(result).toEqual({
          count: 10,
          avg: 2.9,
          stars: { '1': 1, '2': 3, '3': 3, '4': 2, '5': 1 },
          commentCount: 4,
          updated: fixedNow,
        })
      })

      it('updates stars and commentCount in the same call when both change', () => {
        const summary = {
          ...baseSummary(),
          count: 3,
          avg: 3,
          commentCount: 1,
          stars: { '1': 0, '2': 1, '3': 1, '4': 1, '5': 0 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 2,
          nextStars: 5,
          previousComment: undefined,
          nextComment: 'Added feedback',
        })

        expect(result.stars).toEqual({ '1': 0, '2': 0, '3': 1, '4': 1, '5': 1 })
        expect(result.count).toBe(3)
        expect(result.avg).toBe(4.0)
        expect(result.commentCount).toBe(2)
        expect(result.updated).toEqual(fixedNow)
      })

      it('clamps previousStars and nextStars before moving buckets', () => {
        const summary = {
          ...baseSummary(),
          count: 2,
          avg: 0,
          commentCount: 0,
          stars: { '1': 1, '2': 0, '3': 0, '4': 0, '5': 1 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 999, // clamps to 5
          nextStars: -10, // clamps to 1
          previousComment: undefined,
          nextComment: undefined,
        })

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
          commentCount: 0,
          stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 5,
          nextStars: 1,
          previousComment: undefined,
          nextComment: undefined,
        })

        expect(result.stars['5']).toBe(0)
        expect(result.stars['1']).toBe(1)
        expect(result.avg).toBe(1)
        expect(result.count).toBe(1)
      })

      it('recomputes avg from buckets after moving a rating between buckets', () => {
        const summary = {
          ...baseSummary(),
          count: 0,
          avg: 0,
          commentCount: 0,
          stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        }

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 3,
          nextStars: 4,
          previousComment: undefined,
          nextComment: undefined,
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
          commentCount: 0,
          stars: { '1': 0, '2': 1, '3': 1, '4': 1, '5': 0 },
        }
        const updatedAt = new Date('2026-01-10T13:00:00.000Z')

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 2,
          nextStars: 5,
          previousComment: undefined,
          nextComment: undefined,
          updatedAt,
        })

        expect(result.updated).toEqual(updatedAt)
      })

      it('does not mutate the input summary object', () => {
        const summary = {
          ...baseSummary(),
          count: 4,
          avg: 2.5,
          commentCount: 1,
          stars: { '1': 1, '2': 1, '3': 1, '4': 1, '5': 0 },
        }

        const snapshot = JSON.parse(JSON.stringify(summary))

        const result = updateQuizRatingSummary({
          summary,
          previousStars: 1,
          nextStars: 5,
          previousComment: 'Old',
          nextComment: 'New',
        })

        expect(summary).toEqual(snapshot)
        expect(result.stars).not.toBe(summary.stars)
      })
    })
  })
})
