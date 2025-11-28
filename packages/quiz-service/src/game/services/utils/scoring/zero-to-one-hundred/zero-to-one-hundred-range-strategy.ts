import { QuestionType } from '@quiz/common'

import {
  BaseZeroToOneHundredScoringStrategy,
  ZeroToOneHundredAnswer,
  ZeroToOneHundredCorrect,
  ZeroToOneHundredMeta,
} from '../core/zero-to-one-hundred-base-strategy'

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
   * All Range answers are treated as "valid" in this mode;
   * the actual quality is expressed as a numeric penalty in `calculateScore`.
   *
   * @param correct Canonical correct Range value.
   * @param answer  Player's Range answer, or `undefined`.
   * @param meta    ZeroToOneHundred Range scoring metadata (currently unused).
   * @returns Always `true` as long as scoring can be computed.
   */
  public isCorrect(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    correct: ZeroToOneHundredCorrect<QuestionType.Range>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    answer: ZeroToOneHundredAnswer<QuestionType.Range> | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    meta: ZeroToOneHundredMeta<QuestionType.Range>,
  ): boolean {
    return true
  }

  /**
   * Calculates the penalty for a ZeroToOneHundred Range answer.
   *
   * Penalty model:
   * - `100` if the answer is outside the [0, 100] range.
   * - `-10` for an exact match with the correct value (bonus).
   * - otherwise the absolute difference between answer and correct.
   *
   * @param presented When the question was shown to the player.
   * @param answered  When the player submitted the answer.
   * @param duration  Allowed answering time in seconds (currently unused).
   * @param points    Additional context or max penalty (currently unused).
   * @param correct   Canonical correct Range value.
   * @param answer    Player's Range answer, or `undefined`.
   * @param meta      ZeroToOneHundred Range scoring metadata (currently unused).
   * @returns The penalty for this answer (lower is better, negative is bonus).
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
    // Return max penalty if out of range
    if (!answer || answer.answer < 0 || answer.answer > 100) {
      return 100
    }

    // Return -10 for exact match
    if (answer.answer === correct.value) {
      return -10
    }

    // Return absolute difference otherwise
    return Math.abs(answer.answer - correct.value)
  }
}
