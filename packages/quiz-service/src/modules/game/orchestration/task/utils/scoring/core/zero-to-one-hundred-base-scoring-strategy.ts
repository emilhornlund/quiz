import { GameMode } from '@quiz/common'

import { BaseScoringStrategy } from './base-scoring-strategy'
import {
  AnswerFor,
  CorrectFor,
  MetaFor,
  QuestionTypeForMode,
} from './scoring-mapped-types'

/**
 * Question types that are valid for the ZeroToOneHundred game mode.
 *
 * This narrows generics for strategies that are specific to
 * the ZeroToOneHundred scoring model.
 */
export type ZeroToOneHundredQuestionType =
  QuestionTypeForMode<GameMode.ZeroToOneHundred>

/**
 * Convenience alias for the "correct answer" payload type for
 * ZeroToOneHundred mode and a specific question type.
 */
export type ZeroToOneHundredCorrect<K extends ZeroToOneHundredQuestionType> =
  CorrectFor<GameMode.ZeroToOneHundred, K>

/**
 * Convenience alias for the "player answer" payload type for
 * ZeroToOneHundred mode and a specific question type.
 */
export type ZeroToOneHundredAnswer<K extends ZeroToOneHundredQuestionType> =
  AnswerFor<GameMode.ZeroToOneHundred, K>

/**
 * Convenience alias for the metadata payload type for
 * ZeroToOneHundred mode and a specific question type.
 */
export type ZeroToOneHundredMeta<K extends ZeroToOneHundredQuestionType> =
  MetaFor<GameMode.ZeroToOneHundred, K>

/**
 * Base class for scoring strategies in ZeroToOneHundred mode.
 *
 * Responsibilities:
 * - Enforces the `ScoringStrategy` contract for questions that
 *   participate in the ZeroToOneHundred scoring model.
 * - Leaves correctness and scoring formulas to concrete subclasses,
 *   allowing this mode to use a different technique than Classic.
 */
export abstract class BaseZeroToOneHundredScoringStrategy<
  K extends ZeroToOneHundredQuestionType,
> extends BaseScoringStrategy<GameMode.ZeroToOneHundred, K> {
  /**
   * Determines whether the provided answer should be considered valid/correct
   * for a ZeroToOneHundred-mode question of type `K`.
   *
   * Implementations may treat correctness as a simple validation, with the
   * actual penalty expressed in `calculateScore`.
   *
   * @param correct Canonical correct-answer payload for this question.
   * @param answer  Player's submitted answer payload, or `undefined`.
   * @param meta    Question-specific scoring metadata for ZeroToOneHundred mode.
   * @returns `true` if the answer is considered valid/correct.
   */
  public abstract isCorrect(
    correct: ZeroToOneHundredCorrect<K>,
    answer: ZeroToOneHundredAnswer<K> | undefined,
    meta: ZeroToOneHundredMeta<K>,
  ): boolean

  /**
   * Calculates the penalty or score for a ZeroToOneHundred-mode answer.
   *
   * Implementations are free to interpret the return value as:
   * - a penalty (e.g. lower is better, negative for bonus)
   * - or a score (e.g. higher is better)
   *
   * @param presented When the question was shown to the player.
   * @param answered  When the player submitted the answer.
   * @param duration  Allowed answering time in seconds.
   * @param points    Maximum number of points or penalty budget for this mode.
   * @param correct   Canonical correct-answer payload for this question.
   * @param answer    Player's submitted answer payload, or `undefined`.
   * @param meta      Question-specific scoring metadata for ZeroToOneHundred mode.
   * @returns The calculated penalty/score for this answer.
   */
  public abstract calculateScore(
    presented: Date,
    answered: Date,
    duration: number,
    points: number,
    correct: ZeroToOneHundredCorrect<K>,
    answer: ZeroToOneHundredAnswer<K> | undefined,
    meta: ZeroToOneHundredMeta<K>,
  ): number
}
