import { PlayerResponseDto } from '@quiz/common'

import {
  ApiPlayerCreatedProperty,
  ApiPlayerIdProperty,
  ApiPlayerModifiedProperty,
  ApiPlayerNicknameProperty,
} from '../decorators/api'

/**
 * Represents the response object for a player.
 */
export class PlayerResponse implements PlayerResponseDto {
  /**
   * The unique identifier of the player.
   */
  @ApiPlayerIdProperty()
  id: string

  /**
   * The nickname of the player.
   */
  @ApiPlayerNicknameProperty()
  nickname: string

  /**
   * The date and time when the player was created.
   */
  @ApiPlayerCreatedProperty()
  created: Date

  /**
   * The date and time when the player record was last modified.
   */
  @ApiPlayerModifiedProperty()
  modified: Date
}
