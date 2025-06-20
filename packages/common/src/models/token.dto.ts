import { Authorities } from './authorities.enum'

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

  /**
   * The list of authorities (permissions or scopes) granted to the token holder.
   * Determines which actions or endpoints the bearer is allowed to access.
   */
  authorities: Authorities[]
}
