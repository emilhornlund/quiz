import { GameParticipantType } from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import { IllegalTaskTypeException } from '../../../exceptions'
import {
  GameDocument,
  LeaderboardTaskItem,
  LeaderboardTaskWithBase,
  TaskType,
} from '../../../repositories/models/schemas'

import { isQuestionResultTask } from './task.utils'

/**
 * Updates all player participants with their latest result data and generates
 * the leaderboard for the current question result task.
 *
 * The function:
 * - Reads each player's previous rank (if any).
 * - Applies the new score, streak, and position from the current task results.
 * - Sorts players by their current rank.
 * - Produces leaderboard entries that include both current and previous positions.
 *
 * @param gameDocument - The current game document containing a QuestionResult task.
 *
 * @returns A list of leaderboard task items reflecting updated ranks, scores, and streaks.
 */
export function updateParticipantsAndBuildLeaderboard(
  gameDocument: GameDocument,
): LeaderboardTaskItem[] {
  if (!isQuestionResultTask(gameDocument)) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.QuestionResult,
    )
  }

  return gameDocument.participants
    .filter((participant) => participant.type === GameParticipantType.PLAYER)
    .map((participant) => {
      const previousRank =
        typeof participant.rank === 'number' && participant.rank > 0
          ? participant.rank
          : undefined

      const resultEntry = gameDocument.currentTask.results.find(
        ({ playerId }) => playerId === participant.participantId,
      )

      if (resultEntry) {
        participant.rank = resultEntry.position
        participant.totalScore = resultEntry.totalScore
        participant.currentStreak = resultEntry.streak
      }

      return { participant, previousRank }
    })
    .filter(
      ({ participant }) =>
        typeof participant.rank === 'number' && participant.rank > 0,
    )
    .sort((a, b) => a.participant.rank - b.participant.rank)
    .map(({ participant, previousRank }) => ({
      playerId: participant.participantId,
      nickname: participant.nickname,
      position: participant.rank,
      previousPosition: previousRank,
      score: participant.totalScore,
      streaks: participant.currentStreak,
    }))
}

/**
 * Constructs a new leaderboard task based on the provided game document.
 *
 * @param gameDocument - The current game document.
 * @param leaderboard - A list of leaderboard task items reflecting updated ranks, scores, and streaks.
 *
 * @throws {IllegalTaskTypeException} If the current task type is not a question result.
 *
 * @returns A new leaderboard task object.
 */
export function buildLeaderboardTask(
  gameDocument: GameDocument,
  leaderboard: LeaderboardTaskItem[],
): LeaderboardTaskWithBase {
  if (!isQuestionResultTask(gameDocument)) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.QuestionResult,
    )
  }

  return {
    _id: uuidv4(),
    type: TaskType.Leaderboard,
    status: 'pending',
    questionIndex: gameDocument.nextQuestion - 1,
    leaderboard,
    created: new Date(),
  }
}
