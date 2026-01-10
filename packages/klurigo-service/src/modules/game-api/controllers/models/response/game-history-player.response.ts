import {
  GameHistoryPlayerDto,
  GameMode,
  GameParticipantType,
  GameStatus,
} from '@klurigo/common'

import {
  ApiGameModeProperty,
  ApiQuizImageCoverProperty,
} from '../../../../quiz-api/controllers/decorators/api'
import {
  ApiGameCreatedProperty,
  ApiGameIdProperty,
  ApiGameNameProperty,
  ApiGameParticipantRankProperty,
  ApiGameParticipantScoreProperty,
  ApiGameParticipantTypeProperty,
  ApiGameStatusProperty,
} from '../../decorators/api'

/**
 * Response object for a player's view of a game history item.
 */
export class GameHistoryPlayerResponse implements GameHistoryPlayerDto {
  /**
   * The unique identifier for the game.
   */
  @ApiGameIdProperty({
    description: 'The unique identifier for the game.',
  })
  readonly id: string

  /**
   * The name of the game.
   */
  @ApiGameNameProperty()
  readonly name: string

  /**
   * The game mode of the game.
   */
  @ApiGameModeProperty()
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
   * The type of participant (always PLAYER).
   */
  @ApiGameParticipantTypeProperty(GameParticipantType.PLAYER)
  readonly participantType: GameParticipantType.PLAYER

  /**
   * The player's final rank in the game.
   */
  @ApiGameParticipantRankProperty()
  readonly rank: number

  /**
   * The player's final score in the game.
   */
  @ApiGameParticipantScoreProperty()
  readonly score: number

  /**
   * The date and time when the game was created.
   */
  @ApiGameCreatedProperty()
  readonly created: Date
}
