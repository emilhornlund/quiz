import { CreateGameResponseDto } from '@quiz/common'

import { GameIdProperty } from '../../decorators'

export class CreateGameResponse implements CreateGameResponseDto {
  @GameIdProperty()
  id: string
}
