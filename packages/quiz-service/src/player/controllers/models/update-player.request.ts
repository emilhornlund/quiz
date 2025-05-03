import { UpdatePlayerRequestDto } from '@quiz/common'

import { ApiPlayerNicknameProperty } from '../decorators/api'

/**
 * Represents the request object for updating a player's profile.
 */
export class UpdatePlayerRequest implements UpdatePlayerRequestDto {
  /**
   * The new nickname of the player to update.
   */
  @ApiPlayerNicknameProperty()
  nickname: string
}
