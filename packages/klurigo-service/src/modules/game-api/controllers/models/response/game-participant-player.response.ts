import { GameResultParticipantDto } from '@klurigo/common'

import {
  ApiGameParticipantIdProperty,
  ApiPlayerNicknameProperty,
} from '../../decorators/api'

/**
 * Response model representing a player participant in a game.
 */
export class GameParticipantPlayerResponse implements GameResultParticipantDto {
  /**
   * The unique identifier of the participant.
   */
  @ApiGameParticipantIdProperty()
  id: string

  /**
   * The nickname of the participant.
   */
  @ApiPlayerNicknameProperty()
  nickname: string
}
