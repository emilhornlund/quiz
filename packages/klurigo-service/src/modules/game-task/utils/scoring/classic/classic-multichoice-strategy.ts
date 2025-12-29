import { QuestionType } from '@klurigo/common'

import {
  BaseClassicScoringStrategy,
  ClassicAnswer,
  ClassicCorrect,
  ClassicMeta,
} from '../core/classic-base-scoring-strategy'

/**
 * Scoring strategy for MultiChoice questions in Classic mode.
 *
 * This strategy:
 * - checks whether the selected alternative index matches the correct index
 * - applies the Classic time-based scoring model to compute the final score
 */
export class ClassicMultiChoiceScoringStrategy extends BaseClassicScoringStrategy<QuestionType.MultiChoice> {
  /**
   * A MultiChoice answer is correct if the selected index equals
   * the correct index.
   *
   * @param correct Canonical correct MultiChoice answer (including index).
   * @param answer  Player's MultiChoice answer, or `undefined`.
   * @param meta    Classic MultiChoice scoring metadata (currently unused).
   * @returns `true` if the selected index matches the correct index.
   */
  public isCorrect(
    correct: ClassicCorrect<QuestionType.MultiChoice>,
    answer: ClassicAnswer<QuestionType.MultiChoice> | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    meta: ClassicMeta<QuestionType.MultiChoice>,
  ): boolean {
    return !!answer && correct.index === answer.answer
  }

  /**
   * Calculates the score for a Classic MultiChoice answer.
   *
   * - Returns 0 if the answer is incorrect.
   * - Otherwise uses the shared Classic time-based scoring model.
   *
   * @param presented When the question was shown to the player.
   * @param answered  When the player submitted the answer.
   * @param duration  Allowed answering time in seconds.
   * @param points    Maximum number of points for the question.
   * @param correct   Canonical correct MultiChoice answer.
   * @param answer    Player's MultiChoice answer, or `undefined`.
   * @param meta      Classic MultiChoice scoring metadata (currently unused).
   * @returns The calculated score for this answer.
   */
  public calculateScore(
    presented: Date,
    answered: Date,
    duration: number,
    points: number,
    correct: ClassicCorrect<QuestionType.MultiChoice>,
    answer: ClassicAnswer<QuestionType.MultiChoice> | undefined,
    meta: ClassicMeta<QuestionType.MultiChoice>,
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
