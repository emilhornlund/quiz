import { QuizGameplaySummary } from '../../../quiz-core/repositories/models/schemas'

/**
 * Computes a normalized difficulty percentage for a quiz based on its
 * aggregated gameplay statistics.
 *
 * The returned value is a number in the range `0..1`, where:
 * - 0 represents very easy gameplay,
 * - 1 represents very difficult gameplay.
 *
 * If no gameplay data is available, `undefined` is returned.
 *
 * @param quizGameplaySummary - Aggregated gameplay statistics for the quiz.
 * @returns A difficulty percentage in the range `0..1`, or `undefined` when no
 *          sufficient gameplay data exists.
 */
export function toQuizGameplaySummaryDifficultyPercentage(
  quizGameplaySummary: QuizGameplaySummary,
): number | undefined {
  const {
    totalClassicCorrectCount,
    totalClassicIncorrectCount,
    totalClassicUnansweredCount,
    totalZeroToOneHundredPrecisionSum,
    totalZeroToOneHundredAnsweredCount,
    totalZeroToOneHundredUnansweredCount,
  } = quizGameplaySummary

  const classicTotal =
    totalClassicCorrectCount +
    totalClassicIncorrectCount +
    totalClassicUnansweredCount

  if (classicTotal > 0) {
    const incorrectRate = totalClassicIncorrectCount / classicTotal
    const unansweredRate = totalClassicUnansweredCount / classicTotal
    return clamp01(incorrectRate * 0.6 + unansweredRate * 1.0)
  }

  const zeroTotal =
    totalZeroToOneHundredAnsweredCount + totalZeroToOneHundredUnansweredCount

  if (zeroTotal > 0 && totalZeroToOneHundredAnsweredCount > 0) {
    const averagePrecision =
      totalZeroToOneHundredPrecisionSum / totalZeroToOneHundredAnsweredCount
    const precisionDifficulty = 1 - averagePrecision
    const unansweredRate = totalZeroToOneHundredUnansweredCount / zeroTotal
    return clamp01(precisionDifficulty * 0.75 + unansweredRate * 0.25)
  }

  return undefined
}

/**
 * Clamps a numeric value to the inclusive range `0..1`.
 *
 * @param value - The value to clamp.
 * @returns The clamped value in the range `0..1`.
 */
function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}
