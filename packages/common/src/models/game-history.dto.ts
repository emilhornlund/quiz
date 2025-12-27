import { GameMode } from './game-mode.enum'
import { GameParticipantType } from './game-participant-type.enum'
import { GameStatus } from './game-status.enum'

/**
 * Base properties shared by all game history entries.
 */
export type GameHistoryBaseDto = {
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
   * The date when the game was first created.
   */
  created: Date
}

/**
 * Represents a game history entry where the user was the host.
 */
export type GameHistoryHostDto = GameHistoryBaseDto & {
  /**
   * The participant type associated with the user's role in the game.
   */
  participantType: GameParticipantType.HOST
}

/**
 * Represents a game history entry where the user was a player.
 */
export type GameHistoryPlayerDto = GameHistoryBaseDto & {
  /**
   * The participant type associated with the user's role in the game.
   */
  participantType: GameParticipantType.PLAYER

  /**
   * The final rank achieved by the participant in the game.
   */
  rank: number

  /**
   * The final score achieved by the participant in the game.
   */
  score: number
}

/**
 * Represents a summary of a previously played or hosted game.
 * Used for displaying a user's game history.
 */
export type GameHistoryDto = GameHistoryHostDto | GameHistoryPlayerDto
