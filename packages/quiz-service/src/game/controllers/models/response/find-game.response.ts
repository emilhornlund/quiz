import { FindGameResponseDto } from '@quiz/common'

import { ApiGameIdProperty } from '../../decorators/api'

export class FindGameResponse implements FindGameResponseDto {
  @ApiGameIdProperty({
    description: 'The unique identifier for the active game.',
  })
  id: string
}
