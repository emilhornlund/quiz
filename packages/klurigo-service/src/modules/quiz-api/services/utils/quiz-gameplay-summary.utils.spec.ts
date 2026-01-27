import { createMockQuizGameplaySummary } from '../../../../../test-utils/data'

import { toQuizGameplaySummaryDifficultyPercentage } from './quiz-gameplay-summary.utils'

describe('Quiz Gameplay Summary', () => {
  describe('toQuizGameplaySummaryDifficultyPercentage', () => {
    it('returns undefined when no gameplay data exists', () => {
      const quizGameplaySummary = createMockQuizGameplaySummary({
        totalClassicCorrectCount: 0,
        totalClassicIncorrectCount: 0,
        totalClassicUnansweredCount: 0,
        totalZeroToOneHundredPrecisionSum: 0,
        totalZeroToOneHundredAnsweredCount: 0,
        totalZeroToOneHundredUnansweredCount: 0,
      })

      const actual =
        toQuizGameplaySummaryDifficultyPercentage(quizGameplaySummary)

      expect(actual).toBeUndefined()
    })

    it('computes Classic difficulty from incorrect and unanswered rates', () => {
      // total = 10 + 30 + 60 = 100
      // incorrectRate = 0.30, unansweredRate = 0.60
      // difficulty = 0.30 * 0.6 + 0.60 * 1.0 = 0.78
      const quizGameplaySummary = createMockQuizGameplaySummary({
        totalClassicCorrectCount: 10,
        totalClassicIncorrectCount: 30,
        totalClassicUnansweredCount: 60,
        totalZeroToOneHundredPrecisionSum: 0,
        totalZeroToOneHundredAnsweredCount: 0,
        totalZeroToOneHundredUnansweredCount: 0,
      })

      const actual =
        toQuizGameplaySummaryDifficultyPercentage(quizGameplaySummary)

      expect(actual).toBeCloseTo(0.78, 10)
    })

    it('computes Classic difficulty correctly when incorrect and unanswered are equal', () => {
      const quizGameplaySummary = createMockQuizGameplaySummary({
        totalClassicCorrectCount: 0,
        totalClassicIncorrectCount: 10,
        totalClassicUnansweredCount: 10,
        totalZeroToOneHundredPrecisionSum: 0,
        totalZeroToOneHundredAnsweredCount: 0,
        totalZeroToOneHundredUnansweredCount: 0,
      })

      const actual =
        toQuizGameplaySummaryDifficultyPercentage(quizGameplaySummary)

      expect(actual).toBeCloseTo(0.8, 10)
    })

    it('computes ZeroToOneHundred difficulty from precision loss and unanswered rate', () => {
      // avgPrecision = 1.6 / 2 = 0.8
      // precisionDifficulty = 0.2
      // unansweredRate = 4 / (2 + 4) = 0.666666...
      // difficulty = 0.2 * 0.75 + 0.666666.. * 0.25
      //           = 0.15 + 0.166666.. = 0.316666..
      const quizGameplaySummary = createMockQuizGameplaySummary({
        totalClassicCorrectCount: 0,
        totalClassicIncorrectCount: 0,
        totalClassicUnansweredCount: 0,
        totalZeroToOneHundredPrecisionSum: 1.6,
        totalZeroToOneHundredAnsweredCount: 2,
        totalZeroToOneHundredUnansweredCount: 4,
      })

      const actual =
        toQuizGameplaySummaryDifficultyPercentage(quizGameplaySummary)

      expect(actual).toBeCloseTo(0.3166666667, 10)
    })

    it('returns undefined for ZeroToOneHundred when there are unanswered counts but no attempts', () => {
      // zeroTotal > 0, but answeredCount === 0 => function should not divide by zero
      const quizGameplaySummary = createMockQuizGameplaySummary({
        totalClassicCorrectCount: 0,
        totalClassicIncorrectCount: 0,
        totalClassicUnansweredCount: 0,
        totalZeroToOneHundredPrecisionSum: 0,
        totalZeroToOneHundredAnsweredCount: 0,
        totalZeroToOneHundredUnansweredCount: 3,
      })

      const actual =
        toQuizGameplaySummaryDifficultyPercentage(quizGameplaySummary)

      expect(actual).toBeUndefined()
    })

    it('clamps ZeroToOneHundred difficulty to 1 when average precision is negative', () => {
      // avgPrecision = -1 / 1 = -1
      // precisionDifficulty = 1 - (-1) = 2
      // unansweredRate = 0 / 1 = 0
      // difficulty = 2 * 0.75 + 0 * 0.25 = 1.5 -> clamp to 1
      const quizGameplaySummary = createMockQuizGameplaySummary({
        totalClassicCorrectCount: 0,
        totalClassicIncorrectCount: 0,
        totalClassicUnansweredCount: 0,
        totalZeroToOneHundredPrecisionSum: -1,
        totalZeroToOneHundredAnsweredCount: 1,
        totalZeroToOneHundredUnansweredCount: 0,
      })

      const actual =
        toQuizGameplaySummaryDifficultyPercentage(quizGameplaySummary)

      expect(actual).toBe(1)
    })
  })
})
