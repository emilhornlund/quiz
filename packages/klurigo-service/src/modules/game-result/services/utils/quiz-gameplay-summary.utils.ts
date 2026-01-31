import { GameMode, isDefined } from '@klurigo/common'

import { QuizGameplaySummary } from '../../../quiz-core/repositories/models/schemas'
import { GameResult } from '../../repositories/models/schemas'

/**
 * Aggregates gameplay statistics from a completed game into an existing
 * quiz-level gameplay summary.
 *
 * The returned summary is a new object and is intended to be persisted
 * on the Quiz document.
 *
 * Behavior:
 * - Increments global counters such as game count and total player count.
 * - Updates Classic-mode correctness and unanswered totals.
 * - Updates ZeroToOneHundred attempted-only precision and unanswered totals.
 *
 * @param existing - The current persisted gameplay summary for the quiz.
 * @param gameResult - The final result of the completed game to aggregate.
 * @param mode - The game mode used to determine which metrics to aggregate.
 * @param now - The timestamp used for the summary update.
 * @returns The updated gameplay summary reflecting the completed game.
 */
export function aggregateQuizGameplaySummary(
  existing: QuizGameplaySummary,
  gameResult: GameResult,
  mode: GameMode,
  now: Date = new Date(),
): QuizGameplaySummary {
  const playerCount = gameResult.players.length

  const base: QuizGameplaySummary = {
    ...existing,
    count: existing.count + 1,
    totalPlayerCount: existing.totalPlayerCount + playerCount,
    lastPlayedAt: maxDate(existing.lastPlayedAt, gameResult.completed),
    updated: now,
  }

  if (mode === GameMode.Classic) {
    const classic = aggregateClassicTotals(gameResult)

    return {
      ...base,
      totalClassicCorrectCount:
        existing.totalClassicCorrectCount + classic.correct,
      totalClassicIncorrectCount:
        existing.totalClassicIncorrectCount + classic.incorrect,
      totalClassicUnansweredCount:
        existing.totalClassicUnansweredCount + classic.unanswered,
    }
  }

  if (mode === GameMode.ZeroToOneHundred) {
    const zero = aggregateZeroToOneHundredTotals(gameResult, playerCount)

    return {
      ...base,
      totalZeroToOneHundredPrecisionSum:
        existing.totalZeroToOneHundredPrecisionSum + zero.precisionSum,
      totalZeroToOneHundredAnsweredCount:
        existing.totalZeroToOneHundredAnsweredCount + zero.answeredCount,
      totalZeroToOneHundredUnansweredCount:
        existing.totalZeroToOneHundredUnansweredCount + zero.unansweredCount,
    }
  }

  return base
}

/**
 * Aggregates Classic-mode answer totals from a completed game result.
 *
 * Uses question-level metrics, which are already aggregated across players.
 *
 * @param gameResult - The completed game result containing question metrics.
 * @returns The aggregated correct, incorrect, and unanswered totals.
 */
function aggregateClassicTotals(gameResult: GameResult): {
  correct: number
  incorrect: number
  unanswered: number
} {
  return gameResult.questions.reduce(
    (acc, q) => ({
      correct: acc.correct + (q.correct ?? 0),
      incorrect: acc.incorrect + (q.incorrect ?? 0),
      unanswered: acc.unanswered + q.unanswered,
    }),
    { correct: 0, incorrect: 0, unanswered: 0 },
  )
}

/**
 * Aggregates ZeroToOneHundred-mode precision and attempt totals from a completed game.
 *
 * Precision is aggregated using attempted answers only:
 * - Precision sum is weighted by the number of attempted answers per question.
 * - Unanswered answers do not contribute to precision.
 *
 * @param gameResult - The completed game result containing question metrics.
 * @param playerCount - The total number of players in the game.
 * @returns The aggregated precision sum, answered count, and unanswered count.
 */
function aggregateZeroToOneHundredTotals(
  gameResult: GameResult,
  playerCount: number,
): {
  precisionSum: number
  answeredCount: number
  unansweredCount: number
} {
  return gameResult.questions.reduce(
    (acc, q) => {
      const unanswered = q.unanswered
      const attempted = Math.max(0, playerCount - unanswered)

      const precisionSum =
        attempted > 0 && isDefined(q.averagePrecision)
          ? acc.precisionSum + q.averagePrecision * attempted
          : acc.precisionSum

      return {
        precisionSum,
        answeredCount: acc.answeredCount + attempted,
        unansweredCount: acc.unansweredCount + unanswered,
      }
    },
    { precisionSum: 0, answeredCount: 0, unansweredCount: 0 },
  )
}

/**
 * Returns the most recent of two optional dates.
 *
 * @param lhs - The first date to compare.
 * @param rhs - The second date to compare.
 * @returns The later date, or the defined date if only one is provided.
 */
function maxDate(lhs?: Date, rhs?: Date): Date | undefined {
  if (!lhs) return rhs
  if (!rhs) return lhs
  return lhs.getTime() >= rhs.getTime() ? lhs : rhs
}
