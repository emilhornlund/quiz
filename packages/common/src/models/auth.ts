/**
 * Which provider used for authentication.
 * Values:
 * - `LOCAL`: email/password stored locally
 */
export enum AuthProvider {
  Local = 'LOCAL',
}

/**
 * Data transfer object for authentication login requests.
 */
export interface AuthLoginRequestDto {
  /**
   * The user’s email address, used to identify their account.
   */
  email: string

  /**
   * The user’s password, used to verify their identity.
   */
  password: string
}

/**
 * Data transfer object for authentication login responses.
 */
export interface AuthLoginResponseDto {
  /**
   * JWT access token—short-lived credential for resource access.
   */
  accessToken: string

  /**
   * JWT refresh token—longer-lived credential to obtain new access tokens.
   */
  refreshToken: string
}

/**
 * Data transfer object for authentication refresh requests.
 */
export interface AuthRefreshRequestDto {
  /**
   * The refresh token previously issued during login.
   */
  refreshToken: string
}

/**
 * Data transfer object for authentication revoke requests.
 */
export interface AuthRevokeRequestDto {
  /**
   * The token previously issued during login (access or refresh).
   */
  readonly token: string
}
