import { CreateGameResponseDto } from '@quiz/common'

import { GameIdProperty } from '../../decorators'

export class CreateGameResponse implements CreateGameResponseDto {
  @GameIdProperty({
    description: 'The unique identifier for the created game.',
  })
  id: string
}
