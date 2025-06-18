/**
 * Data transfer object for authentication requests.
 */
export interface LegacyAuthRequestDto {
  /**
   * The unique identifier of the client.
   * - Format: UUID
   */
  clientId: string
}

/**
 * Data transfer object for authentication responses.
 */
export interface LegacyAuthResponseDto {
  /**
   * The JWT token issued to the client.
   */
  token: string

  /**
   * The client.
   */
  client: LegacyAuthClientResponseDto

  /**
   * The player.
   */
  player: LegacyAuthPlayerResponseDto
}

/**
 * Data transfer object for authentication client responses.
 */
export interface LegacyAuthClientResponseDto {
  /**
   * The unique identifier of the client.
   */
  id: string

  /**
   * The nickname of the client.
   */
  name: string
}

/**
 * Data transfer object for authentication player responses.
 */
export interface LegacyAuthPlayerResponseDto {
  /**
   * The unique identifier of the player.
   */
  id: string

  /**
   * The nickname of the player.
   */
  nickname: string
}
