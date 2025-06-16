import { QuestionRangeAnswerMargin } from '../models'

/**
 * Calculates the acceptable margin value for a range question based on the given margin type.
 * This determines the range around the correct answer that is considered valid.
 *
 * @param {QuestionRangeAnswerMargin} margin - The margin type (None, Low, Medium, High, Maximum).
 * @param {number} correct - The correct answer value for the range question.
 *
 * @returns {number} - The calculated margin value. If the margin is Maximum, returns `Number.MAX_VALUE`.
 *                     If the margin is None, returns `0`.
 *
 * @example
 * calculateRangeMargin(QuestionRangeAnswerMargin.Low, 100) // Returns 5 (5% of 100)
 * calculateRangeMargin(QuestionRangeAnswerMargin.Medium, 100) // Returns 10 (10% of 100)
 * calculateRangeMargin(QuestionRangeAnswerMargin.High, 100) // Returns 20 (20% of 100)
 * calculateRangeMargin(QuestionRangeAnswerMargin.Maximum, 100) // Returns Number.MAX_VALUE
 * calculateRangeMargin(QuestionRangeAnswerMargin.None, 100) // Returns 0
 */
export function calculateRangeMargin(
  margin: QuestionRangeAnswerMargin,
  correct: number,
): number {
  const base = Math.abs(correct)
  switch (margin) {
    case QuestionRangeAnswerMargin.Low:
      return base * 0.05
    case QuestionRangeAnswerMargin.Medium:
      return base * 0.1
    case QuestionRangeAnswerMargin.High:
      return base * 0.2
    case QuestionRangeAnswerMargin.Maximum:
      return Number.MAX_VALUE
    case QuestionRangeAnswerMargin.None:
    default:
      return 0
  }
}
