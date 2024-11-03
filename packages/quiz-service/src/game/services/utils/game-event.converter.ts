import { GameEvent, GameEventType } from '@quiz/common'

import { GameDocument, Player, TaskType } from '../models/schemas'

export function buildHostGameEvent(document: GameDocument): GameEvent {
  switch (document.currentTask.type) {
    case TaskType.Lobby:
      return {
        type: GameEventType.GameLobbyHost,
        game: { id: document._id, pin: document.pin },
        players: document.players.map(({ nickname }) => ({ nickname })),
      }
  }
}

export function buildPlayerGameEvent(
  document: GameDocument,
  player?: Player,
): GameEvent {
  switch (document.currentTask.type) {
    case TaskType.Lobby:
      return {
        type: GameEventType.GameLobbyPlayer,
        player: { nickname: player.nickname },
      }
  }
}
