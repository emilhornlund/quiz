import { Authority, TokenScope } from '@quiz/common'

import {
  DEFAULT_ACCESS_TOKEN_EXPIRATION_TIME,
  DEFAULT_CLIENT_AUTHORITIES,
  DEFAULT_GAME_AUTHORITIES,
  DEFAULT_REFRESH_AUTHORITIES,
  DEFAULT_REFRESH_TOKEN_EXPIRATION_TIME,
  DEFAULT_USER_AUTHORITIES,
} from './token.constants'

/**
 * Returns the list of Authority that should be embedded in a token
 * for the given scope and token type.
 *
 * @param scope - The logical API area (Client, Game, or User) for this token.
 * @param isRefreshToken - Whether this token is a refresh token.
 * @returns Array of Authority to include in the JWT payload.
 */
export function getTokenAuthorities(
  scope: TokenScope,
  isRefreshToken: boolean,
): Authority[] {
  if (isRefreshToken) {
    return DEFAULT_REFRESH_AUTHORITIES
  }

  switch (scope) {
    case TokenScope.Client:
      return DEFAULT_CLIENT_AUTHORITIES
    case TokenScope.Game:
      return DEFAULT_GAME_AUTHORITIES
    case TokenScope.User:
      return DEFAULT_USER_AUTHORITIES
  }
}

/**
 * Determines the expiration duration string for a token of the given
 * scope and type.
 *
 * @param scope - The logical API area (Client, Game, or User) for this token.
 * @param isRefreshToken - Whether this token is a refresh token.
 * @returns A string value (e.g. '15m', '1h', or '30d').
 */
export function getTokenExpiresIn(
  scope: TokenScope,
  isRefreshToken: boolean,
): string {
  if (isRefreshToken) {
    return DEFAULT_REFRESH_TOKEN_EXPIRATION_TIME
  }

  switch (scope) {
    case TokenScope.Client:
      return '1h'
    case TokenScope.Game:
    case TokenScope.User:
      return DEFAULT_ACCESS_TOKEN_EXPIRATION_TIME
  }
}
