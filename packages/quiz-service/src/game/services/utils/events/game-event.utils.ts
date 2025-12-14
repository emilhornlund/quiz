import { GameEvent } from '@quiz/common'

import {
  GameDocument,
  ParticipantBase,
  ParticipantPlayer,
} from '../../../repositories/models/schemas'
import {
  isLeaderboardTask,
  isLobbyTask,
  isPodiumTask,
  isQuestionResultTask,
  isQuestionTask,
  isQuitTask,
} from '../tasks'

import { GameEventMetaData } from './game-event-metadata.interface'
import { buildGameLeaderboardHostEvent } from './game-leaderboard-event.utils'
import { buildGameLoadingEvent } from './game-loading-event.utils'
import {
  buildGameBeginHostEvent,
  buildGameBeginPlayerEvent,
  buildGameLobbyHostEvent,
  buildGameLobbyPlayerEvent,
} from './game-lobby-event.utils'
import { buildGamePodiumHostEvent } from './game-podium-event.utils'
import {
  buildGameQuestionHostEvent,
  buildGameQuestionPlayerEvent,
  buildGameQuestionPreviewHostEvent,
  buildGameQuestionPreviewPlayerEvent,
} from './game-question-event.utils'
import { buildGameQuitEvent } from './game-quit-event.utils'
import {
  buildGameResultHostEvent,
  buildGameResultPlayerEvent,
} from './game-result-event.utils'

/**
 * Constructs an event for the host based on the current state of the game document.
 *
 * @param game - The `GameDocument` representing the current state of the game, including its task and associated data.
 * @param metadata - Metadata including the number of submissions and related player information.
 *
 * @throws {Error} Throws an error if the task type is not recognized.
 *
 * @returns A `GameEvent` tailored for the host, depending on the type and status of the current task.
 */
export function buildHostGameEvent(
  game: GameDocument,
  metadata: Partial<GameEventMetaData> = {},
): GameEvent {
  if (isLobbyTask(game)) {
    switch (game.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGameLobbyHostEvent(game)
      case 'completed':
        return buildGameBeginHostEvent()
    }
  }

  if (isQuestionTask(game)) {
    switch (game.currentTask.status) {
      case 'pending':
        return buildGameQuestionPreviewHostEvent(game)
      case 'active':
        return buildGameQuestionHostEvent(
          game,
          metadata.currentAnswerSubmissions ?? 0,
          metadata.totalAnswerSubmissions ?? 0,
        )
      case 'completed':
        return buildGameLoadingEvent()
    }
  }

  if (isQuestionResultTask(game)) {
    switch (game.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGameResultHostEvent(game)
      case 'completed':
        return buildGameLoadingEvent()
    }
  }

  if (isLeaderboardTask(game)) {
    switch (game.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGameLeaderboardHostEvent(game)
      case 'completed':
        return buildGameLoadingEvent()
    }
  }

  if (isPodiumTask(game)) {
    switch (game.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGamePodiumHostEvent(game)
      case 'completed':
        return buildGameLoadingEvent()
    }
  }

  if (isQuitTask(game)) {
    return buildGameQuitEvent(game.status)
  }

  throw new Error('Unknown task')
}

/**
 * Constructs an event for a player based on the current state of the game document and the provided player details.
 *
 * @param game - The `GameDocument` representing the current state of the game, including its task and associated data.
 * @param player - The player participant object for whom the event is being built.
 * @param metadata - Metadata containing the number of submissions and related player information.
 *
 * @throws {Error} Throws an error if the task type is not recognized.
 *
 * @returns A `GameEvent` tailored for the player, depending on the type and status of the current task.
 */
export function buildPlayerGameEvent(
  game: GameDocument,
  player: ParticipantBase & ParticipantPlayer,
  metadata: Partial<GameEventMetaData> = {},
): GameEvent {
  if (isLobbyTask(game)) {
    switch (game.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGameLobbyPlayerEvent(player)
      case 'completed':
        return buildGameBeginPlayerEvent(player)
    }
  }

  if (isQuestionTask(game)) {
    switch (game.currentTask.status) {
      case 'pending':
        return buildGameQuestionPreviewPlayerEvent(game, player)
      case 'active':
      case 'completed':
        return buildGameQuestionPlayerEvent(
          game,
          player,
          metadata.playerAnswerSubmission,
        )
    }
  }

  if (
    isQuestionResultTask(game) ||
    isLeaderboardTask(game) ||
    isPodiumTask(game)
  ) {
    switch (game.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGameResultPlayerEvent(game, player)
      case 'completed':
        return buildGameLoadingEvent()
    }
  }

  if (isQuitTask(game)) {
    return buildGameQuitEvent(game.status)
  }

  throw new Error('Unknown task')
}
