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
}
