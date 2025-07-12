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
 * Data transfer object for authentication game requests.
 */
export interface AuthGameRequestDto {
  /**
   * The unique identifier of the game to authenticate.
   */
  readonly gameId?: string

  /**
   * The unique 6-digit game PIN of the game to authenticate.
   */
  readonly gamePIN?: string
}

/**
 * Data transfer object for authentication responses.
 */
export interface AuthResponseDto {
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

/**
 * Data Transfer Object for a password change request.
 *
 * Contains the user’s current password for verification and the desired new password.
 */
export interface AuthPasswordChangeRequestDto {
  /**
   * The user’s current password.
   */
  readonly oldPassword: string

  /**
   * The new password the user wants to set.
   */
  readonly newPassword: string
}

/**
 * Data Transfer Object for a password reset request.
 */
export interface AuthPasswordResetRequestDto {
  /**
   * The user’s email.
   */
  readonly email: string
}
