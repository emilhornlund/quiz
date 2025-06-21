import { Authorities } from './authorities.enum'

/**
 * The functional area of the application that this token is intended for.
 */
export enum TokenScope {
  /**
   * Device scope—grants the same access as `User` tokens.
   * This will eventually be removed in favor of the `User` scope.
   */
  Client = 'CLIENT',

  /**
   * Game scope—grants access to endpoints for hosting, joining, and
   * managing ongoing quiz games.
   */
  Game = 'GAME',

  /**
   * User scope—grants access to all endpoints that require a signed‐in user.
   */
  User = 'USER',
}

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
   * Which broad area of the API this token is allowed to interact with.
   */
  scope: TokenScope

  /**
   * The list of authorities (permissions or scopes) granted to the token holder.
   * Determines which actions or endpoints the bearer is allowed to access.
   */
  authorities: Authorities[]
}
