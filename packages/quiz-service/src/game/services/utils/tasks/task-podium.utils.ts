import { v4 as uuidv4 } from 'uuid'

import { IllegalTaskTypeException } from '../../../exceptions'
import {
  BaseTask,
  GameDocument,
  LeaderboardTaskItem,
  PodiumTask,
  TaskType,
} from '../../../repositories/models/schemas'
import { isQuestionResultTask } from '../task.utils'

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
): BaseTask & PodiumTask {
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
