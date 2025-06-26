import { Authority } from './authority.enum'
import { GameParticipantType } from './game-participant-type.enum'

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
  authorities: Authority[]
}

/**
 * A token issued for game‐related operations.
 *
 * Extends `TokenDto` with:
 *  - `scope: TokenScope.Game`
 *  - `gameId`: the UUID of the game
 *  - `participantType`: whether this token is for the host or a player
 */
export interface GameTokenDto extends TokenDto {
  /**
   * Always `TokenScope.Game` for game tokens.
   */
  readonly scope: TokenScope.Game

  /**
   * The unique identifier (UUID) of the game this token pertains to.
   */
  readonly gameId: string

  /**
   * The role of the bearer in the game: host or player.
   */
  readonly participantType: GameParticipantType
}
