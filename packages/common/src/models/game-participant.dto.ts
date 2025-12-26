/**
 * Represents a player participant in a game.
 */
export type GameParticipantPlayerDto = {
  /**
   * The unique identifier of the participant.
   */
  readonly id: string

  /**
   * The nickname of the participant.
   */
  readonly nickname: string
}
