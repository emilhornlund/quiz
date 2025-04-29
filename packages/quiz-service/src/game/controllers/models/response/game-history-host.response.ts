import {
  GameHistoryHostDto,
  GameMode,
  GameParticipantType,
  GameStatus,
} from '@quiz/common'

import {
  ApiModeProperty,
  ApiQuizImageCoverProperty,
} from '../../../../quiz/controllers/decorators/api'
import { GameIdProperty } from '../../decorators'
import {
  ApiGameCreatedProperty,
  ApiGameNameProperty,
  ApiGameParticipantTypeProperty,
  ApiGameStatusProperty,
} from '../../decorators/api'

/**
 * Response object for the host's view of a game history item.
 */
export class GameHistoryHostResponse implements GameHistoryHostDto {
  /**
   * The unique identifier for the game.
   */
  @GameIdProperty({
    description: 'The unique identifier for the game.',
  })
  readonly id: string

  /**
   * The name of the game.
   */
  @ApiGameNameProperty()
  readonly name: string

  /**
   * The actual game mode.
   */
  @ApiModeProperty()
  readonly mode: GameMode

  /**
   * The status of the game (e.g., Completed, Active).
   */
  @ApiGameStatusProperty()
  readonly status: GameStatus

  /**
   * The URL of the cover image for the quiz.
   */
  @ApiQuizImageCoverProperty()
  readonly imageCoverURL?: string

  /**
   * The type of participant (always HOST).
   */
  @ApiGameParticipantTypeProperty(GameParticipantType.HOST)
  readonly participantType: GameParticipantType.HOST

  /**
   * The date and time when the game was created.
   */
  @ApiGameCreatedProperty()
  readonly created: Date
}
