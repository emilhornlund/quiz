import { v4 as uuidv4 } from 'uuid'

import {
  GameDocument,
  LeaderboardTaskItem,
  PodiumTaskWithBase,
  TaskType,
} from '../../game-core/repositories/models/schemas'
import { IllegalTaskTypeException } from '../exceptions'

import { isQuestionResultTask } from './task-type-guards'

/**
 * Constructs a new podium task based on the provided game document.
 *
 * @param gameDocument - The current game document.
 * @param leaderboard - A list of leaderboard task items reflecting updated ranks, scores, and streaks.
 *
 * @throws {IllegalTaskTypeException} If the current task type is not a question result.
 *
 * @returns A new podium task object.
 */
export function buildPodiumTask(
  gameDocument: GameDocument,
  leaderboard: LeaderboardTaskItem[],
): PodiumTaskWithBase {
  if (!isQuestionResultTask(gameDocument)) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.QuestionResult,
    )
  }

  return {
    _id: uuidv4(),
    type: TaskType.Podium,
    status: 'pending',
    leaderboard,
    created: new Date(),
  }
}
