import { GameEvent } from '@quiz/common'

export type DistributedEvent = {
  clientId?: string
  event: GameEvent
}
