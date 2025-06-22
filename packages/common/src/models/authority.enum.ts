/**
 * Enumeration of granted authorities (permissions or scopes)
 * that can be assigned to a JWT to control access to protected resources.
 */
export enum Authority {
  /**
   * Permission to allow using a valid refresh token to obtain a new access token.
   */
  RefreshAuth = 'REFRESH_AUTH',
}
