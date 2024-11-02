import { GameEventType } from '@quiz/common'
import { HydratedDocument } from 'mongoose'

import { PlayerNotFoundException } from '../../exceptions'
import { DistributedEvent } from '../models/event'
import { Game } from '../models/schemas'
import { Player } from '../models/schemas/player.schema'
import { TaskType } from '../models/schemas/task.schema'

export function toDistributedEvent(
  document: HydratedDocument<Game>,
  clientId: string,
): DistributedEvent {
  const player = document.players.find((player) => player._id === clientId)

  if (document.hostClientId !== clientId && !player) {
    throw new PlayerNotFoundException(clientId)
  }

  if (player) {
    return toDistributedPlayerGameEvent(document, player)
  }

  return toDistributedHostGameEvent(document)
}

export function toDistributedHostGameEvent(
  document: HydratedDocument<Game>,
): DistributedEvent {
  const task = document.tasks.at(-1)

  switch (task.type) {
    case TaskType.Lobby:
      return {
        clientId: document.hostClientId,
        event: {
          type: GameEventType.GameLobbyHost,
          game: { id: document._id, pin: document.pin },
          players: document.players.map(({ nickname }) => ({ nickname })),
        },
      }
  }
}

export function toDistributedPlayerGameEvent(
  document: HydratedDocument<Game>,
  player?: Player,
): DistributedEvent {
  const task = document.tasks.at(-1)

  switch (task.type) {
    case TaskType.Lobby:
      return {
        clientId: player._id,
        event: {
          type: GameEventType.GameLobbyPlayer,
          player: { nickname: player.nickname },
        },
      }
  }
}
