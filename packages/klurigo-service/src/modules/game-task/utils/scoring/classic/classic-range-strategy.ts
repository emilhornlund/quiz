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
 * - awards points using a combination of:
 *   - a time-based score from the Classic model (20%)
 *   - a precision-based score (80%) derived from distance to the correct value,
 *     with a minimum precision floor and an exponent curve to emphasize closeness
 */
export class ClassicRangeScoringStrategy extends BaseClassicScoringStrategy<QuestionType.Range> {
  /**
   * Minimum precision multiplier applied to correct Range answers.
   *
   * This prevents answers at the edge of the allowed margin from receiving ~0 precision points,
   * while still rewarding closer answers more than farther answers.
   */
  protected readonly MIN_PRECISION_MULTIPLIER = 0.25

  /**
   * Exponent applied to the linear precision value to emphasize closeness.
   *
   * Values > 1 make near-perfect answers significantly more valuable than
   * moderately close answers, while still preserving a minimum precision floor.
   *
   * Examples:
   * - 1.0 → linear precision
   * - 1.25 → subtle emphasis on closeness
   * - 1.5 → clear emphasis on closeness (recommended)
   */
  protected readonly PRECISION_CURVE_EXPONENT = 1.5

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
   * - 0 points if the answer is outside the allowed margin or submitted after the time limit.
   * - 20% of the score comes from answering quickly (Classic time-based model).
   * - 80% of the score comes from precision:
   *   - compute a linear precision value (1 at the correct value, 0 at the margin boundary)
   *   - apply an exponent curve to emphasize closeness
   *   - lift the result with a minimum precision floor so correct boundary answers still
   *     receive a meaningful portion of the precision score
   *
   * Notes:
   * - For `QuestionRangeAnswerMargin.None`, an exact match is required and awards full precision.
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
    const difference = Math.abs(correct.value - answer.answer)

    // use the larger side in case bounds are asymmetric near edges
    const radius = Math.max(correct.value - lower, upper - correct.value)

    // linear precision: 1 at the correct value, 0 at the margin boundary
    const linearPrecision =
      radius > 0
        ? Math.max(0, 1 - difference / radius)
        : correct.value === answer.answer
          ? 1
          : 0

    const floor = this.MIN_PRECISION_MULTIPLIER
    // apply curve + floor so closer answers score more while boundary-correct answers are not punished to ~0
    const curved = Math.pow(linearPrecision, this.PRECISION_CURVE_EXPONENT)
    const precisionMultiplier = floor + (1 - floor) * curved

    const precisionScore =
      points * precisionMultiplier * this.PRECISION_BASED_MULTIPLIER

    // Total score: sum of speed and precision scores
    return Math.round(speedScore + precisionScore)
  }
}
