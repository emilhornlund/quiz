/**
 * Represents a JSON Web Token (JWT) payload.
 */
export interface TokenDto {
  /**
   * The subject of the token, typically a user or client identifier.
   */
  sub: string

  /**
   * The expiration time of the token, represented as a UNIX timestamp.
   */
  exp: number
}
