import { GameMode } from './game-mode.enum'
import { GameParticipantType } from './game-participant-type.enum'
import { GameStatus } from './game-status.enum'

/**
 * Represents a summary of a previously played or hosted game.
 * Used for displaying a user's game history.
 */
export type GameHistoryDto = {
  /**
   * The unique identifier of the game.
   */
  id: string

  /**
   * The name of the game.
   */
  name: string

  /**
   * The mode of the game (e.g., Classic, ZeroToOneHundred).
   */
  mode: GameMode

  /**
   * The current status of the game (e.g., Active, Completed, Expired).
   */
  status: GameStatus

  /**
   * The URL of the cover image associated with the game.
   */
  imageCoverURL?: string

  /**
   * The participant type associated with the user's role in the game (e.g., Host, Player).
   */
  participantType: GameParticipantType

  /**
   * The date when the game was first created.
   */
  created: Date
} & (
  | {
      /**
       * The host participant type associated with the user's role in the game.
       */
      participantType: GameParticipantType.HOST
    }
  | {
      /**
       * The player participant type associated with the user's role in the game.
       */
      participantType: GameParticipantType.PLAYER

      /**
       * The final rank achieved by the participant in the game.
       *
       * For hosts, this value may be omitted or set to a default.
       */
      rank: number

      /**
       * The final score achieved by the participant in the game.
       *
       * For hosts, this value may be omitted or set to a default.
       */
      score: number
    }
)
