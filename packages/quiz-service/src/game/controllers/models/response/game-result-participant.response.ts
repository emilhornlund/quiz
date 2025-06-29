import { GameResultParticipantDto } from '@quiz/common'

import { ApiPlayerNicknameProperty } from '../../../../player/controllers/decorators/api'
import { ApiGameParticipantIdProperty } from '../../decorators/api'

/**
 * Response model representing a participant (either host or player) in a game result.
 */
export class GameResultParticipantResponse implements GameResultParticipantDto {
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
