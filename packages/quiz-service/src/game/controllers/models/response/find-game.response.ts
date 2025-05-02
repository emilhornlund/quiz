import { FindGameResponseDto } from '@quiz/common'

import { ApiGameIdProperty } from '../../decorators/api'

/**
 * Represents the response structure for finding an existing game.
 */
export class FindGameResponse implements FindGameResponseDto {
  /**
   * The unique identifier for the active game.
   */
  @ApiGameIdProperty({
    description: 'The unique identifier for the active game.',
  })
  id: string
}
