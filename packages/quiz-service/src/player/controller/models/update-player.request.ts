import { UpdatePlayerRequestDto } from '@quiz/common'

import { PlayerNicknameProperty } from '../../../game/controllers/decorators'

/**
 * Represents the request object for updating a player's profile.
 */
export class UpdatePlayerRequest implements UpdatePlayerRequestDto {
  /**
   * The new nickname of the player to update.
   */
  @PlayerNicknameProperty()
  nickname: string
}
