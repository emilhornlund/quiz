import { GameEvent, GameEventType } from '@quiz/common'

import { GameDocument, Player, TaskType } from '../models/schemas'

/**
 * Constructs an event for the host based on the current state of the game document.
 *
 * @param {GameDocument} document - The `GameDocument` representing the current state of the game, including its task and associated data.
 *
 * @returns A `GameEvent` tailored for the host, depending on the type and status of the current task.
 */
export function buildHostGameEvent(document: GameDocument): GameEvent {
  switch (document.currentTask.type) {
    case TaskType.Lobby: {
      switch (document.currentTask.status) {
        case 'pending':
          return { type: GameEventType.GameLoading }
        case 'active':
          return {
            type: GameEventType.GameLobbyHost,
            game: { id: document._id, pin: document.pin },
            players: document.players.map(({ nickname }) => ({ nickname })),
          }
        case 'completed':
          return { type: GameEventType.GameBeginHost }
      }
    }
  }
}

/**
 * Constructs an event for a player based on the current state of the game document and the provided player details.
 *
 * @param {GameDocument} document - The `GameDocument` representing the current state of the game, including its task and associated data.
 * @param {Player} player - The `Player` object representing the participant for whom the event is being built.
 *
 * @returns A `GameEvent` tailored for the player, depending on the type and status of the current task.
 */
export function buildPlayerGameEvent(
  document: GameDocument,
  player?: Player,
): GameEvent {
  switch (document.currentTask.type) {
    case TaskType.Lobby: {
      switch (document.currentTask.status) {
        case 'pending':
          return { type: GameEventType.GameLoading }
        case 'active':
          return {
            type: GameEventType.GameLobbyPlayer,
            player: { nickname: player.nickname },
          }
        case 'completed':
          return {
            type: GameEventType.GameBeginPlayer,
            player: { nickname: player.nickname },
          }
      }
    }
  }
}
