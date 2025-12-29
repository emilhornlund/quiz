import {
  QuestionType,
  ZERO_TO_ONE_HUNDRED_BONUS_POINTS,
  ZERO_TO_ONE_HUNDRED_MAX_ANSWER,
  ZERO_TO_ONE_HUNDRED_MIN_ANSWER,
  ZERO_TO_ONE_HUNDRED_PENALTY_POINTS,
} from '@klurigo/common'

import {
  BaseZeroToOneHundredScoringStrategy,
  ZeroToOneHundredAnswer,
  ZeroToOneHundredCorrect,
  ZeroToOneHundredMeta,
} from '../core/zero-to-one-hundred-base-scoring-strategy'

/**
 * Scoring strategy for Range questions in ZeroToOneHundred mode.
 *
 * This strategy interprets the result as a "distance penalty":
 * - `-10` for an exact match
 * - absolute difference from the correct value otherwise
 * - `100` penalty if the answer is outside the allowed [0, 100] range
 */
export class ZeroToOneHundredRangeScoringStrategy extends BaseZeroToOneHundredScoringStrategy<QuestionType.Range> {
  /**
   * Checks whether a ZeroToOneHundred Range answer is within the valid domain.
   *
   * Rules:
   * - An answer must be provided.
   * - The numeric value must be within the inclusive [0, 100] bounds.
   *
   * This method does not look at correctness versus the target value; it only
   * validates that the answer is in a usable range for scoring.
   *
   * @param correct Canonical correct Range value.
   * @param answer  Player's Range answer, or `undefined`.
   * @param meta    ZeroToOneHundred Range scoring metadata (currently unused).
   * @returns `true` if an answer exists and is within the valid [0, 100] range.
   */
  public isCorrect(
    correct: ZeroToOneHundredCorrect<QuestionType.Range>,
    answer: ZeroToOneHundredAnswer<QuestionType.Range> | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    meta: ZeroToOneHundredMeta<QuestionType.Range>,
  ): boolean {
    return (
      !!answer &&
      answer.answer >= ZERO_TO_ONE_HUNDRED_MIN_ANSWER &&
      answer.answer <= ZERO_TO_ONE_HUNDRED_MAX_ANSWER
    )
  }

  /**
   * Calculates the penalty for a ZeroToOneHundred Range answer.
   *
   * Penalty model (lower is better, negative is a bonus):
   * - Returns `ZERO_TO_ONE_HUNDRED_PENALTY_POINTS` when:
   *   - no answer is provided,
   *   - the answer is outside the [0, 100] range, or
   *   - the answer is submitted after the allowed duration.
   * - Returns `ZERO_TO_ONE_HUNDRED_BONUS_POINTS` for an exact match with the correct value.
   * - Otherwise returns the absolute difference between `answer` and `correct.value`.
   *
   * Time handling:
   * - `duration` is used together with `presented`/`answered` via `isAnsweredInTime`
   *   to enforce that late answers receive the maximum penalty.
   *
   * @param presented When the question was shown to the player.
   * @param answered  When the player submitted the answer.
   * @param duration  Allowed answering time in seconds.
   * @param points    Additional context or max penalty (currently unused).
   * @param correct   Canonical correct Range value.
   * @param answer    Player's Range answer, or `undefined`.
   * @param meta      ZeroToOneHundred Range scoring metadata (currently unused).
   * @returns The penalty for this answer.
   */
  public calculateScore(
    presented: Date,
    answered: Date,
    duration: number,
    points: number,
    correct: ZeroToOneHundredCorrect<QuestionType.Range>,
    answer: ZeroToOneHundredAnswer<QuestionType.Range> | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    meta: ZeroToOneHundredMeta<QuestionType.Range>,
  ): number {
    // Return max penalty if out of range or invalid answer
    if (
      !answer ||
      answer.answer < ZERO_TO_ONE_HUNDRED_MIN_ANSWER ||
      answer.answer > ZERO_TO_ONE_HUNDRED_MAX_ANSWER ||
      !this.isAnsweredInTime(presented, answered, duration)
    ) {
      return ZERO_TO_ONE_HUNDRED_PENALTY_POINTS
    }

    // Return -10 for exact match
    if (answer.answer === correct.value) {
      return ZERO_TO_ONE_HUNDRED_BONUS_POINTS
    }

    // Return absolute difference otherwise
    return Math.abs(answer.answer - correct.value)
  }
}
