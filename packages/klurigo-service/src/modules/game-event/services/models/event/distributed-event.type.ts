import { GameEvent } from '@klurigo/common'

export type DistributedEvent = {
  playerId?: string
  event: GameEvent
}
