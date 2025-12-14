import { GameEventType, GamePodiumHostEvent } from '@quiz/common'

import { GameDocument, TaskType } from '../../../repositories/models/schemas'

/**
 * Builds a podium event for the host.
 *
 * @param game - The game document containing the current podium task.
 */
export function buildGamePodiumHostEvent(
  game: GameDocument & { currentTask: { type: TaskType.Podium } },
): GamePodiumHostEvent {
  return {
    type: GameEventType.GamePodiumHost,
    leaderboard: game.currentTask.leaderboard
      .slice(0, 5)
      .map(({ position, nickname, score }) => ({
        position,
        nickname,
        score,
      })),
  }
}
