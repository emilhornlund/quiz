import {
  AnswerFor,
  CorrectFor,
  MetaFor,
  QuestionTypeForMode,
  SupportedGameMode,
} from './scoring-mapped-types'

/**
 * Generic scoring strategy contract for a specific game mode and question type.
 *
 * Implementations:
 * - decide whether a given answer is correct (`isCorrect`)
 * - compute a numeric score for the answer (`calculateScore`), typically
 *   based on correctness, time and configured max points.
 */
export interface ScoringStrategy<
  T extends SupportedGameMode,
  K extends QuestionTypeForMode<T>,
> {
  isCorrect(
    correct: CorrectFor<T, K>,
    answer: AnswerFor<T, K> | undefined,
    meta: MetaFor<T, K>,
  ): boolean

  calculateScore(
    presented: Date | undefined,
    answered: Date,
    duration: number,
    points: number,
    correct: CorrectFor<T, K>,
    answer: AnswerFor<T, K> | undefined,
    meta: MetaFor<T, K>,
  ): number
}
