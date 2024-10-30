import { JoinGameResponseDto } from '@quiz/common'

import { GameIdProperty, GameTokenProperty } from '../../decorators'

export class JoinGameResponse implements JoinGameResponseDto {
  @GameIdProperty({
    description: 'The unique identifier for the game.',
  })
  id: string

  @GameTokenProperty()
  token: string
}
