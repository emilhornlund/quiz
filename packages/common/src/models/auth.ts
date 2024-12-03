/**
 * Data transfer object for authentication requests.
 */
export interface AuthRequestDto {
  /**
   * The unique identifier of the client.
   * - Format: UUID
   */
  clientId: string
}

/**
 * Data transfer object for authentication responses.
 */
export interface AuthResponseDto {
  /**
   * The JWT token issued to the client.
   */
  token: string

  /**
   * The client.
   */
  client: AuthClientResponseDto

  /**
   * The player.
   */
  player: AuthPlayerResponseDto
}

/**
 * Data transfer object for authentication client responses.
 */
export interface AuthClientResponseDto {
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
export interface AuthPlayerResponseDto {
  /**
   * The unique identifier of the player.
   */
  id: string

  /**
   * The nickname of the player.
   */
  nickname: string
}
