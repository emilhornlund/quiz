import { CreateGameResponseDto } from '@klurigo/common'

import { ApiGameIdProperty } from '../../decorators/api'

/**
 * Represents the response structure for creating a new game.
 */
export class CreateGameResponse implements CreateGameResponseDto {
  /**
   * The unique identifier of the created game.
   */
  @ApiGameIdProperty({
    description: 'The unique identifier for the created game.',
  })
  id: string
}
