import { QuestionType } from '@quiz/common'

import {
  BaseClassicScoringStrategy,
  ClassicAnswer,
  ClassicCorrect,
  ClassicMeta,
} from '../core/classic-base-scoring-strategy'

/**
 * Scoring strategy for True/False questions in Classic mode.
 *
 * This strategy:
 * - compares the submitted boolean value with the correct boolean
 * - applies the Classic time-based scoring model if correct
 */
export class ClassicTrueFalseScoringStrategy extends BaseClassicScoringStrategy<QuestionType.TrueFalse> {
  /**
   * A True/False answer is correct if the submitted value matches
   * the correct boolean value.
   *
   * @param correct Canonical correct True/False value.
   * @param answer  Player's True/False answer, or `undefined`.
   * @param meta    True/False scoring metadata (currently unused).
   * @returns `true` if the boolean values are equal.
   */
  public isCorrect(
    correct: ClassicCorrect<QuestionType.TrueFalse>,
    answer: ClassicAnswer<QuestionType.TrueFalse> | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    meta: ClassicMeta<QuestionType.TrueFalse>,
  ): boolean {
    return !!answer && correct.value === answer.answer
  }

  /**
   * Calculates the score for a Classic True/False answer.
   *
   * - Returns 0 if the answer is incorrect.
   * - Otherwise uses the shared Classic time-based scoring model.
   *
   * @param presented When the question was shown to the player.
   * @param answered  When the player submitted the answer.
   * @param duration  Allowed answering time in seconds.
   * @param points    Maximum number of points for the question.
   * @param correct   Canonical correct True/False value.
   * @param answer    Player's True/False answer, or `undefined`.
   * @param meta      True/False scoring metadata (currently unused).
   * @returns The calculated score for this answer.
   */
  public calculateScore(
    presented: Date,
    answered: Date,
    duration: number,
    points: number,
    correct: ClassicCorrect<QuestionType.TrueFalse>,
    answer: ClassicAnswer<QuestionType.TrueFalse> | undefined,
    meta: ClassicMeta<QuestionType.TrueFalse>,
  ): number {
    if (!answer || !this.isAnsweredInTime(presented, answered, duration)) {
      return 0
    }

    if (!this.isCorrect(correct, answer, meta)) {
      return 0
    }

    return Math.round(
      this.calculateBaseScore(presented, answered, duration, points),
    )
  }
}
