import { CreateGameResponseDto } from '@quiz/common'

import { GameIdProperty } from '../../decorators'

/**
 * Represents the response structure for creating a new game.
 */
export class CreateGameResponse implements CreateGameResponseDto {
  /**
   * The unique identifier of the created game.
   */
  @GameIdProperty({
    description: 'The unique identifier for the created game.',
  })
  id: string
}
