import { GameEvent, GameEventType } from '@quiz/common'

import { GameDocument, Player, TaskType } from '../models/schemas'

export function buildHostGameEvent(document: GameDocument): GameEvent {
  switch (document.currentTask.type) {
    case TaskType.Lobby:
      return document.currentTask.status === 'active'
        ? {
            type: GameEventType.GameLobbyHost,
            game: { id: document._id, pin: document.pin },
            players: document.players.map(({ nickname }) => ({ nickname })),
          }
        : { type: GameEventType.GameBeginHost }
  }
}

export function buildPlayerGameEvent(
  document: GameDocument,
  player?: Player,
): GameEvent {
  switch (document.currentTask.type) {
    case TaskType.Lobby:
      return document.currentTask.status === 'active'
        ? {
            type: GameEventType.GameLobbyPlayer,
            player: { nickname: player.nickname },
          }
        : {
            type: GameEventType.GameBeginPlayer,
            player: { nickname: player.nickname },
          }
  }
}
