/**
 * Represents the structure of a player object in API responses.
 */
export interface PlayerResponseDto {
  /**
   * The unique identifier of the player.
   */
  id: string

  /**
   * The nickname of the player.
   */
  nickname: string

  /**
   * The date and time when the player was created.
   */
  created: Date

  /**
   * The date and time when the player record was last modified.
   */
  modified: Date
}

/**
 * Response DTO for the player link code, containing the code and expiration time.
 */
export interface PlayerLinkCodeResponseDto {
  /**
   * The generated player link code.
   */
  code: string

  /**
   * The expiration date and time of the link code.
   */
  expires: Date
}
