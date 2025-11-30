import { QuestionType } from '@quiz/common'

import {
  BaseClassicScoringStrategy,
  ClassicAnswer,
  ClassicCorrect,
  ClassicMeta,
} from '../core/classic-base-scoring-strategy'

/**
 * Scoring strategy for Puzzle questions in Classic mode.
 *
 * This strategy:
 * - counts the number of puzzle tiles in the correct position
 * - applies the Classic time-based scoring model and scales it by
 *   the fraction of correctly placed tiles
 */
export class ClassicPuzzleScoringStrategy extends BaseClassicScoringStrategy<QuestionType.Puzzle> {
  /**
   * A Puzzle answer is considered "correct enough" if at least one tile
   * is in the correct position. Full scoring still depends on how many
   * tiles are correct.
   *
   * @param correct Canonical correct puzzle configuration.
   * @param answer  Player's puzzle configuration, or `undefined`.
   * @param meta    Puzzle scoring metadata (currently unused).
   * @returns `true` if at least one tile is placed correctly.
   */
  public isCorrect(
    correct: ClassicCorrect<QuestionType.Puzzle>,
    answer: ClassicAnswer<QuestionType.Puzzle> | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    meta: ClassicMeta<QuestionType.Puzzle>,
  ): boolean {
    return this.hasAnyCorrectPuzzlePosition(correct, answer)
  }

  /**
   * Calculates the score for a Classic Puzzle answer.
   *
   * Scoring model:
   * - 0 points if no tiles are in the correct position or `answer.created` is missing.
   * - Otherwise:
   *   - compute a Classic time-based base score
   *   - scale it by the fraction of correctly placed tiles (correct / total)
   *
   * @param presented When the question was shown to the player.
   * @param answered  When the player submitted the answer.
   * @param duration  Allowed answering time in seconds.
   * @param points    Maximum number of points for the question.
   * @param correct   Canonical correct puzzle configuration.
   * @param answer    Player's puzzle configuration, or `undefined`.
   * @param meta      Puzzle scoring metadata (currently unused).
   * @returns The calculated score for this answer.
   */
  public calculateScore(
    presented: Date,
    answered: Date,
    duration: number,
    points: number,
    correct: ClassicCorrect<QuestionType.Puzzle>,
    answer: ClassicAnswer<QuestionType.Puzzle> | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    meta: ClassicMeta<QuestionType.Puzzle>,
  ): number {
    if (!answer || !this.isAnsweredInTime(presented, answered, duration)) {
      return 0
    }

    const total = correct?.value?.length ?? 0

    const correctCount = this.countCorrectPuzzlePositions(correct, answer)
    if (correctCount === 0) {
      return 0
    }

    const base = this.calculateBaseScore(presented, answered, duration, points)
    if (base <= 0) {
      return 0
    }

    const fraction = correctCount / total
    return Math.round(base * fraction)
  }

  /**
   * Counts how many positions in the puzzle answer match the correct value.
   *
   * @param correct The correct puzzle answer.
   * @param answer  The submitted puzzle answer.
   * @returns Number of positions that are correct (0 if inputs are invalid or lengths differ).
   */
  private countCorrectPuzzlePositions(
    correct: ClassicCorrect<QuestionType.Puzzle>,
    answer?: ClassicAnswer<QuestionType.Puzzle>,
  ): number {
    const correctVals = correct?.value
    const givenVals = answer?.answer

    if (
      !Array.isArray(correctVals) ||
      !Array.isArray(givenVals) ||
      correctVals.length !== givenVals.length
    ) {
      return 0
    }

    let count = 0
    for (let i = 0; i < correctVals.length; i += 1) {
      if (correctVals[i] === givenVals[i]) {
        count += 1
      }
    }
    return count
  }

  /**
   * Returns true if at least one puzzle tile is in the correct position.
   * Useful as a quick guard before computing partial credit.
   *
   * @param correct The correct puzzle answer.
   * @param answer  The submitted puzzle answer.
   */
  private hasAnyCorrectPuzzlePosition(
    correct: ClassicCorrect<QuestionType.Puzzle>,
    answer?: ClassicAnswer<QuestionType.Puzzle>,
  ): boolean {
    return this.countCorrectPuzzlePositions(correct, answer) > 0
  }
}
