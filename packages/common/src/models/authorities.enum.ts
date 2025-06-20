/**
 * Enumeration of granted authorities (permissions or scopes)
 * that can be assigned to a JWT to control access to protected resources.
 */
export enum Authorities {
  /**
   * Permission to allow use of the legacy client authentication.
   */
  LegacyAuth = 'LEGACY_AUTH',
}
