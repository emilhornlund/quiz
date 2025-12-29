import {
  AnswerFor,
  CorrectFor,
  MetaFor,
  QuestionTypeForMode,
  SupportedGameMode,
} from './scoring-mapped-types'
import { ScoringStrategy } from './scoring-strategy.interface'

/**
 * Generic base class for scoring strategies across all game modes.
 *
 * This abstraction:
 * - enforces the scoring contract via `isCorrect` and `calculateScore`
 * - provides shared helpers that are mode-agnostic (for example `isAnsweredInTime`)
 *
 * Concrete subclasses are responsible for implementing:
 * - how correctness is determined for their game mode and question type
 * - how the final numeric score or penalty is calculated
 */
export abstract class BaseScoringStrategy<
  T extends SupportedGameMode,
  K extends QuestionTypeForMode<T>,
> implements ScoringStrategy<T, K> {
  public abstract isCorrect(
    correct: CorrectFor<T, K>,
    answer: AnswerFor<T, K> | undefined,
    meta: MetaFor<T, K>,
  ): boolean

  public abstract calculateScore(
    presented: Date,
    answered: Date,
    duration: number,
    points: number,
    correct: CorrectFor<T, K>,
    answer: AnswerFor<T, K> | undefined,
    meta: MetaFor<T, K>,
  ): number

  /**
   * Determines whether a player's answer was submitted within the allowed time window.
   *
   * The answer is considered "in time" when:
   * - `duration` is a positive, finite number.
   * - `presented` and `answered` are valid `Date` instances.
   * - The answer timestamp is not earlier than `presented`.
   * - The answer timestamp is not later than `presented + duration` (in seconds).
   *
   * @param presented When the question was shown to the player.
   * @param answered  When the player submitted the answer.
   * @param duration  Allowed answering time in seconds.
   * @returns `true` if the answer was submitted within the allowed time window, otherwise `false`.
   */
  public isAnsweredInTime(
    presented: Date,
    answered: Date,
    duration: number,
  ): boolean {
    if (!presented || !answered) {
      return false
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      return false
    }

    const start = presented.getTime()
    const at = answered.getTime()

    if (Number.isNaN(start) || Number.isNaN(at)) {
      return false
    }

    if (at < start) {
      return false
    }

    const end = start + duration * 1000
    return at <= end
  }
}
