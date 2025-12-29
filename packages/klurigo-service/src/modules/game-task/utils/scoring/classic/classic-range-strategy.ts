import {
  calculateRangeBounds,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@klurigo/common'

import {
  BaseClassicScoringStrategy,
  ClassicAnswer,
  ClassicCorrect,
  ClassicMeta,
} from '../core/classic-base-scoring-strategy'

/**
 * Scoring strategy for Range (slider) questions in Classic mode.
 *
 * This strategy:
 * - checks whether the submitted numeric value is within an allowed margin
 *   around the correct value
 * - combines a precision score with a time-based score from the Classic model
 */
export class ClassicRangeScoringStrategy extends BaseClassicScoringStrategy<QuestionType.Range> {
  /**
   * Determines whether a Range answer is correct based on the configured margin.
   *
   * - For `QuestionRangeAnswerMargin.None`, the answer must match exactly.
   * - Otherwise, the answer must be within the computed bounds around `correct.value`.
   *
   * @param correct Canonical correct Range value.
   * @param answer  Player's Range answer, or `undefined`.
   * @param meta    Range scoring metadata (margin, min/max, step).
   * @returns `true` if the answer is within the allowed bounds.
   */
  public isCorrect(
    correct: ClassicCorrect<QuestionType.Range>,
    answer: ClassicAnswer<QuestionType.Range> | undefined,
    meta: ClassicMeta<QuestionType.Range>,
  ): boolean {
    const { margin, min, max, step } = meta
    if (!answer) {
      return false
    }

    if (margin === QuestionRangeAnswerMargin.None) {
      return correct.value === answer.answer
    }

    const { lower, upper } = calculateRangeBounds(
      margin,
      correct.value,
      min,
      max,
      step,
    )
    return answer.answer >= lower && answer.answer <= upper
  }

  /**
   * Calculates the score for a Classic Range answer.
   *
   * Scoring model:
   * - 0 points if the answer is outside the allowed margin.
   * - 20% of the score comes from answering quickly (Classic time-based model).
   * - 80% of the score comes from how close the answer is to the correct value:
   *   - full 80% for an answer at the center
   *   - linearly decreasing to 0 at the edge of the allowed radius
   *
   * @param presented When the question was shown to the player.
   * @param answered  When the player submitted the answer.
   * @param duration  Allowed answering time in seconds.
   * @param points    Maximum number of points for the question.
   * @param correct   Canonical correct Range value.
   * @param answer    Player's Range answer, or `undefined`.
   * @param meta      Range scoring metadata (margin, min/max, step).
   * @returns The calculated score for this answer.
   */
  public calculateScore(
    presented: Date,
    answered: Date,
    duration: number,
    points: number,
    correct: ClassicCorrect<QuestionType.Range>,
    answer: ClassicAnswer<QuestionType.Range> | undefined,
    meta: ClassicMeta<QuestionType.Range>,
  ): number {
    if (!answer || !this.isAnsweredInTime(presented, answered, duration)) {
      return 0
    }

    const { margin, min, max, step } = meta

    // If the answer is not correct based on the question logic, return 0
    if (!this.isCorrect(correct, answer, meta)) {
      return 0
    }

    // Calculate speed-based score (20%)
    const speedScore =
      this.calculateBaseScore(presented, answered, duration, points) *
      this.SPEED_BASED_MULTIPLIER

    // Special handling for None margin (exact match required)
    if (margin === QuestionRangeAnswerMargin.None) {
      return Math.round(speedScore + points * this.PRECISION_BASED_MULTIPLIER) // Full precision score for exact matches
    }

    // For other margins, calculate precision-based score (80%)
    const { lower, upper } = calculateRangeBounds(
      margin,
      correct.value,
      min,
      max,
      step,
    )

    // distance from the correct value
    const difference = Math.abs(correct.value - answer!.answer)

    // use the larger side in case bounds are asymmetric near edges
    const radius = Math.max(correct.value - lower, upper - correct.value)

    // precision: 1 at the center, 0 at/ beyond the edge
    const precisionMultiplier =
      radius > 0
        ? Math.max(0, 1 - difference / radius)
        : correct.value === answer!.answer
          ? 1
          : 0

    const precisionScore =
      points * precisionMultiplier * this.PRECISION_BASED_MULTIPLIER

    // Total score: sum of speed and precision scores
    return Math.round(speedScore + precisionScore)
  }
}
