/**
 * DTO for creating a new user.
 */
export interface CreateUserRequestDto {
  /**
   * The user’s unique email address.
   */
  readonly email: string

  /**
   * The user’s password.
   */
  readonly password: string

  /**
   * Optional given name (first name) of the user.
   */
  readonly givenName?: string

  /**
   * Optional family name (last name) of the user.
   */
  readonly familyName?: string
}

/**
 * DTO returned after creating a user.
 */
export interface CreateUserResponseDto {
  /**
   * The new user’s unique identifier (UUID).
   */
  readonly id: string

  /**
   * The new user’s email address.
   */
  readonly email: string

  /**
   * The new user’s given name, if provided.
   */
  readonly givenName?: string

  /**
   * The new user’s family name, if provided.
   */
  readonly familyName?: string

  /**
   * Timestamp when the user was created (ISO 8601 string).
   */
  readonly created: Date

  /**
   * Timestamp when the user was last updated (ISO 8601 string).
   */
  readonly updated: Date
}
