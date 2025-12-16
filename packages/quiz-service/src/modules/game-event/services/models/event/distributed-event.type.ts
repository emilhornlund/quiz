import { GameEvent } from '@quiz/common'

export type DistributedEvent = {
  playerId?: string
  event: GameEvent
}
