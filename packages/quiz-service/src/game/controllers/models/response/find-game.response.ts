import { FindGameResponseDto } from '@quiz/common'

import { GameIdProperty } from '../../decorators'

export class FindGameResponse implements FindGameResponseDto {
  @GameIdProperty({
    description: 'The unique identifier for the active game.',
  })
  id: string
}
