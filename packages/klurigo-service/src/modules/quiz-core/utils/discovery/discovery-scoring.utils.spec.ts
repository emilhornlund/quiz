import { Quiz } from '../../repositories/models/schemas'

import {
  computeBayesianRatingScore,
  computeQualityScore,
  computeTrendingScore,
  PLAY_SCALE_MAX,
  PLAYER_SCALE_MAX,
  QUALITY_WEIGHT_COVER,
  QUALITY_WEIGHT_DESCRIPTION,
  QUALITY_WEIGHT_PLAYERS,
  QUALITY_WEIGHT_PLAYS,
  QUALITY_WEIGHT_QUESTIONS,
  QUALITY_WEIGHT_RATING,
  RecentActivityStats,
  TRENDING_PLAY_WEIGHT,
  TRENDING_SCALE_MAX,
  TRENDING_WINDOW_DAYS,
} from './discovery-scoring.utils'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeQuiz = (overrides: Partial<Quiz> = {}): Quiz =>
  ({
    imageCoverURL: 'https://example.com/cover.jpg',
    description: 'A quiz with a sufficiently long description',
    questions: Array.from({ length: 10 }, (_, i) => ({ _id: `q${i}` })),
    gameplaySummary: {
      count: 0,
      totalPlayerCount: 0,
    },
    ratingSummary: {
      count: 0,
      avg: 0,
    },
    ...overrides,
  }) as unknown as Quiz

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('Discovery Scoring Utils — constants', () => {
  it('TRENDING_PLAY_WEIGHT should be 1', () => {
    expect(TRENDING_PLAY_WEIGHT).toBe(1)
  })

  it('TRENDING_WINDOW_DAYS should be 7', () => {
    expect(TRENDING_WINDOW_DAYS).toBe(7)
  })

  it('TRENDING_SCALE_MAX should be 10000', () => {
    expect(TRENDING_SCALE_MAX).toBe(10000)
  })

  it('PLAY_SCALE_MAX should be 10000', () => {
    expect(PLAY_SCALE_MAX).toBe(10000)
  })

  it('PLAYER_SCALE_MAX should be 10000', () => {
    expect(PLAYER_SCALE_MAX).toBe(10000)
  })

  it('QUALITY_WEIGHT_COVER should be 10', () => {
    expect(QUALITY_WEIGHT_COVER).toBe(10)
  })

  it('QUALITY_WEIGHT_DESCRIPTION should be 15', () => {
    expect(QUALITY_WEIGHT_DESCRIPTION).toBe(15)
  })

  it('QUALITY_WEIGHT_QUESTIONS should be 15', () => {
    expect(QUALITY_WEIGHT_QUESTIONS).toBe(15)
  })

  it('QUALITY_WEIGHT_PLAYS should be 30', () => {
    expect(QUALITY_WEIGHT_PLAYS).toBe(30)
  })

  it('QUALITY_WEIGHT_PLAYERS should be 15', () => {
    expect(QUALITY_WEIGHT_PLAYERS).toBe(15)
  })

  it('QUALITY_WEIGHT_RATING should be 15', () => {
    expect(QUALITY_WEIGHT_RATING).toBe(15)
  })
})

// ---------------------------------------------------------------------------
// computeBayesianRatingScore
// ---------------------------------------------------------------------------

describe('computeBayesianRatingScore', () => {
  const globalMean = 3.5
  const minCount = 10

  it('low-count quiz should be pulled toward the global mean', () => {
    const quiz = makeQuiz({
      ratingSummary: { count: 1, avg: 5 } as any,
    })
    const score = computeBayesianRatingScore(quiz, globalMean, minCount)
    // With count=1 and minCount=10, the mean should dominate
    expect(score).toBeCloseTo((1 / 11) * 5 + (10 / 11) * globalMean, 5)
    expect(score).toBeLessThan(5)
    expect(score).toBeGreaterThan(globalMean)
  })

  it('high-count quiz should stay near its own average', () => {
    const quiz = makeQuiz({
      ratingSummary: { count: 1000, avg: 4.8 } as any,
    })
    const score = computeBayesianRatingScore(quiz, globalMean, minCount)
    expect(score).toBeCloseTo((1000 / 1010) * 4.8 + (10 / 1010) * globalMean, 5)
    // Should be very close to 4.8
    expect(score).toBeGreaterThan(4.7)
  })

  it('quiz with zero ratings should equal the global mean', () => {
    const quiz = makeQuiz({
      ratingSummary: { count: 0, avg: 0 } as any,
    })
    const score = computeBayesianRatingScore(quiz, globalMean, minCount)
    expect(score).toBeCloseTo(globalMean, 5)
  })

  it('result should be in [0, 5] for valid inputs', () => {
    const quiz = makeQuiz({
      ratingSummary: { count: 50, avg: 4.0 } as any,
    })
    const score = computeBayesianRatingScore(quiz, globalMean, minCount)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(5)
  })

  it('should not return NaN when ratingSummary is entirely missing', () => {
    const quiz = makeQuiz({ ratingSummary: undefined as any })
    const score = computeBayesianRatingScore(quiz, globalMean, minCount)
    expect(score).not.toBeNaN()
    expect(isFinite(score)).toBe(true)
  })

  it('should fall back to globalMean when ratingSummary is missing', () => {
    const quiz = makeQuiz({ ratingSummary: undefined as any })
    const score = computeBayesianRatingScore(quiz, globalMean, minCount)
    expect(score).toBeCloseTo(globalMean, 5)
  })

  it('should fall back to globalMean when ratingSummary fields are missing', () => {
    const quiz = makeQuiz({ ratingSummary: {} as any })
    const score = computeBayesianRatingScore(quiz, globalMean, minCount)
    expect(score).toBeCloseTo(globalMean, 5)
  })
})

// ---------------------------------------------------------------------------
// computeQualityScore
// ---------------------------------------------------------------------------

describe('computeQualityScore', () => {
  const globalMean = 3.5
  const minRatingCount = 10

  it('result should be within [0, 100]', () => {
    const quiz = makeQuiz()
    const score = computeQualityScore(quiz, globalMean, minRatingCount)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('more plays should yield a higher score (monotonicity)', () => {
    const fewerPlays = makeQuiz({
      gameplaySummary: { count: 10, totalPlayerCount: 5 } as any,
    })
    const morePlays = makeQuiz({
      gameplaySummary: { count: 1000, totalPlayerCount: 500 } as any,
    })
    expect(
      computeQualityScore(morePlays, globalMean, minRatingCount),
    ).toBeGreaterThan(
      computeQualityScore(fewerPlays, globalMean, minRatingCount),
    )
  })

  it('changing globalMean should change the result', () => {
    const quiz = makeQuiz({
      ratingSummary: { count: 5, avg: 4 } as any,
    })
    const scoreA = computeQualityScore(quiz, 2.0, minRatingCount)
    const scoreB = computeQualityScore(quiz, 4.5, minRatingCount)
    expect(scoreA).not.toEqual(scoreB)
  })

  it('changing minRatingCount should change the result', () => {
    const quiz = makeQuiz({
      ratingSummary: { count: 5, avg: 4 } as any,
    })
    const scoreA = computeQualityScore(quiz, globalMean, 5)
    const scoreB = computeQualityScore(quiz, globalMean, 50)
    expect(scoreA).not.toEqual(scoreB)
  })

  describe('cover sub-score', () => {
    it('quiz with cover should score higher than quiz without cover', () => {
      const withCover = makeQuiz({ imageCoverURL: 'https://img.com/c.jpg' })
      const withoutCover = makeQuiz({ imageCoverURL: undefined })
      expect(
        computeQualityScore(withCover, globalMean, minRatingCount),
      ).toBeGreaterThan(
        computeQualityScore(withoutCover, globalMean, minRatingCount),
      )
    })
  })

  describe('description length bucket boundaries', () => {
    it.each([
      [19, 0],
      [20, 4],
      [49, 4],
      [50, 8],
      [99, 8],
      [100, 12],
      [199, 12],
      [200, 15],
    ])(
      'description length %i should produce description sub-score %i',
      (length, expectedDescScore) => {
        const withDesc = makeQuiz({
          imageCoverURL: undefined,
          description: 'A'.repeat(length),
        })
        const withoutDesc = makeQuiz({
          imageCoverURL: undefined,
          description: undefined,
        })
        const diff =
          computeQualityScore(withDesc, globalMean, minRatingCount) -
          computeQualityScore(withoutDesc, globalMean, minRatingCount)
        expect(diff).toBeCloseTo(expectedDescScore, 5)
      },
    )
  })

  describe('question count bucket boundaries', () => {
    it.each([
      [9, 0],
      [10, 4],
      [14, 4],
      [15, 8],
      [19, 8],
      [20, 12],
      [29, 12],
      [30, 15],
    ])(
      'question count %i should produce question sub-score %i',
      (count, expectedQScore) => {
        const withN = makeQuiz({
          imageCoverURL: undefined,
          description: undefined,
          questions: Array.from({ length: count }, (_, i) => ({
            _id: `q${i}`,
          })) as any,
        })
        const withZero = makeQuiz({
          imageCoverURL: undefined,
          description: undefined,
          questions: [] as any,
        })
        const diff =
          computeQualityScore(withN, globalMean, minRatingCount) -
          computeQualityScore(withZero, globalMean, minRatingCount)
        expect(diff).toBeCloseTo(expectedQScore, 5)
      },
    )
  })

  it('Bayesian pull at low rating count reduces rating sub-score vs high count', () => {
    const lowCountQuiz = makeQuiz({
      ratingSummary: { count: 1, avg: 5.0 } as any,
    })
    const highCountQuiz = makeQuiz({
      ratingSummary: { count: 500, avg: 5.0 } as any,
    })
    // High-count quiz with same avg=5 should score higher
    expect(
      computeQualityScore(highCountQuiz, globalMean, minRatingCount),
    ).toBeGreaterThan(
      computeQualityScore(lowCountQuiz, globalMean, minRatingCount),
    )
  })

  it('maximum possible score should be 100', () => {
    const quiz = makeQuiz({
      imageCoverURL: 'https://img.com/c.jpg',
      description: 'A'.repeat(200),
      questions: Array.from({ length: 30 }, (_, i) => ({
        _id: `q${i}`,
      })) as any,
      gameplaySummary: {
        count: PLAY_SCALE_MAX,
        totalPlayerCount: PLAYER_SCALE_MAX,
      } as any,
      ratingSummary: { count: 10000, avg: 5 } as any,
    })
    const score = computeQualityScore(quiz, 5, minRatingCount)
    expect(score).toBeCloseTo(100, 1)
  })

  describe('robustness — partial documents', () => {
    it('should not throw when ratingSummary is missing', () => {
      const quiz = makeQuiz({ ratingSummary: undefined as any })
      expect(() =>
        computeQualityScore(quiz, globalMean, minRatingCount),
      ).not.toThrow()
    })

    it('should return a score within [0, 100] when ratingSummary is missing', () => {
      const quiz = makeQuiz({ ratingSummary: undefined as any })
      const score = computeQualityScore(quiz, globalMean, minRatingCount)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should not throw when gameplaySummary is missing', () => {
      const quiz = makeQuiz({ gameplaySummary: undefined as any })
      expect(() =>
        computeQualityScore(quiz, globalMean, minRatingCount),
      ).not.toThrow()
    })

    it('should return a score within [0, 100] when gameplaySummary is missing', () => {
      const quiz = makeQuiz({ gameplaySummary: undefined as any })
      const score = computeQualityScore(quiz, globalMean, minRatingCount)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should not throw when questions is missing', () => {
      const quiz = makeQuiz({ questions: undefined as any })
      expect(() =>
        computeQualityScore(quiz, globalMean, minRatingCount),
      ).not.toThrow()
    })

    it('should return a score within [0, 100] when questions is missing', () => {
      const quiz = makeQuiz({ questions: undefined as any })
      const score = computeQualityScore(quiz, globalMean, minRatingCount)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should treat whitespace-only imageCoverURL as absent for cover sub-score', () => {
      const withBlankCover = makeQuiz({ imageCoverURL: '   ' })
      const withoutCover = makeQuiz({ imageCoverURL: undefined })
      expect(
        computeQualityScore(withBlankCover, globalMean, minRatingCount),
      ).toEqual(computeQualityScore(withoutCover, globalMean, minRatingCount))
    })

    it('should apply trimmed description length for description sub-score', () => {
      // "   " + 20 chars + "   " has a trimmed length of 20 → bucket 4
      const withPaddedDesc = makeQuiz({
        imageCoverURL: undefined,
        description: '   ' + 'A'.repeat(20) + '   ',
      })
      const withExactDesc = makeQuiz({
        imageCoverURL: undefined,
        description: 'A'.repeat(20),
      })
      expect(
        computeQualityScore(withPaddedDesc, globalMean, minRatingCount),
      ).toEqual(computeQualityScore(withExactDesc, globalMean, minRatingCount))
    })
  })
})

// ---------------------------------------------------------------------------
// computeTrendingScore
// ---------------------------------------------------------------------------

describe('computeTrendingScore', () => {
  it('zero recent plays should yield a score of 0', () => {
    const stats: RecentActivityStats = { recentPlayCount: 0 }
    expect(computeTrendingScore(stats)).toBe(0)
  })

  it('higher recentPlayCount should yield a higher score', () => {
    const low: RecentActivityStats = { recentPlayCount: 10 }
    const high: RecentActivityStats = { recentPlayCount: 100 }
    expect(computeTrendingScore(high)).toBeGreaterThan(
      computeTrendingScore(low),
    )
  })

  it('score should be capped at 100', () => {
    const stats: RecentActivityStats = { recentPlayCount: 999999 }
    expect(computeTrendingScore(stats)).toBe(100)
  })

  it('recentPlayCount equal to TRENDING_SCALE_MAX should yield 100', () => {
    const stats: RecentActivityStats = {
      recentPlayCount: TRENDING_SCALE_MAX / TRENDING_PLAY_WEIGHT,
    }
    expect(computeTrendingScore(stats)).toBe(100)
  })

  it('score should scale linearly with TRENDING_PLAY_WEIGHT', () => {
    // Score formula: min(100, recentPlayCount * TRENDING_PLAY_WEIGHT / TRENDING_SCALE_MAX * 100)
    // For recentPlayCount=100: score = 100 * 1 / 10000 * 100 = 1
    const stats: RecentActivityStats = { recentPlayCount: 100 }
    const expected = Math.min(
      100,
      ((100 * TRENDING_PLAY_WEIGHT) / TRENDING_SCALE_MAX) * 100,
    )
    expect(computeTrendingScore(stats)).toBeCloseTo(expected, 5)
  })

  it('result should always be in [0, 100]', () => {
    const values = [0, 1, 50, 100, 500, 1000, 10000, 100000]
    for (const v of values) {
      const score = computeTrendingScore({ recentPlayCount: v })
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    }
  })
})
