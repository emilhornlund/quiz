import { QuestionType } from '@quiz/common'

import {
  BaseClassicScoringStrategy,
  ClassicAnswer,
  ClassicCorrect,
  ClassicMeta,
} from '../core/classic-base-scoring-strategy'

/**
 * Scoring strategy for TypeAnswer (free text) questions in Classic mode.
 *
 * This strategy:
 * - checks free-text equality in a case-insensitive, trimmed form
 * - applies the Classic time-based scoring model if correct
 */
export class ClassicTypeAnswerScoringStrategy extends BaseClassicScoringStrategy<QuestionType.TypeAnswer> {
  /**
   * A TypeAnswer answer is correct if the normalized (trimmed,
   * case-insensitive) user input matches the stored correct value.
   *
   * @param correct Canonical correct text answer.
   * @param answer  Player's text answer, or `undefined`.
   * @param meta    TypeAnswer scoring metadata (currently unused).
   * @returns `true` if the normalized strings are equal.
   */
  public isCorrect(
    correct: ClassicCorrect<QuestionType.TypeAnswer>,
    answer: ClassicAnswer<QuestionType.TypeAnswer> | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    meta: ClassicMeta<QuestionType.TypeAnswer>,
  ): boolean {
    return (
      !!correct.value &&
      !!answer?.answer &&
      correct.value.trim().toLowerCase() === answer.answer.trim().toLowerCase()
    )
  }

  /**
   * Calculates the score for a Classic TypeAnswer answer.
   *
   * - Returns 0 if the answer is incorrect.
   * - Otherwise uses the shared Classic time-based scoring model.
   *
   * @param presented When the question was shown to the player.
   * @param answered  When the player submitted the answer.
   * @param duration  Allowed answering time in seconds.
   * @param points    Maximum number of points for the question.
   * @param correct   Canonical correct text answer.
   * @param answer    Player's text answer, or `undefined`.
   * @param meta      TypeAnswer scoring metadata (currently unused).
   * @returns The calculated score for this answer.
   */
  public calculateScore(
    presented: Date,
    answered: Date,
    duration: number,
    points: number,
    correct: ClassicCorrect<QuestionType.TypeAnswer>,
    answer: ClassicAnswer<QuestionType.TypeAnswer> | undefined,
    meta: ClassicMeta<QuestionType.TypeAnswer>,
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
