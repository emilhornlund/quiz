import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  AuthProvider,
  EMAIL_REGEX,
  FAMILY_NAME_REGEX,
  GIVEN_NAME_REGEX,
  PLAYER_NICKNAME_MAX_LENGTH,
  PLAYER_NICKNAME_MIN_LENGTH,
  PLAYER_NICKNAME_REGEX,
  UserProfileResponseDto,
} from '@quiz/common'

/**
 * Response returned after successful user creation.
 */
export class UserProfileResponse implements UserProfileResponseDto {
  /**
   * The user’s unique identifier.
   */
  @ApiProperty({
    title: 'User ID',
    description: 'Unique identifier for the user.',
    type: String,
    format: 'uuid',
  })
  readonly id: string

  /**
   * The user’s email address.
   */
  @ApiProperty({
    title: 'Email',
    description: 'Email address of the user.',
    type: String,
    format: 'email',
    pattern: EMAIL_REGEX.source,
    example: 'user@example.com',
  })
  readonly email: string

  /**
   * The user’s unverified email address, if provided.
   */
  @ApiPropertyOptional({
    title: 'Unverified Email',
    description: 'The user’s unverified email address.',
    type: String,
    format: 'email',
    pattern: EMAIL_REGEX.source,
    example: 'user@example.com',
  })
  readonly unverifiedEmail?: string

  /**
   * The user’s given name, if provided.
   */
  @ApiPropertyOptional({
    title: 'Given Name',
    description: 'First name of the user.',
    type: String,
    pattern: GIVEN_NAME_REGEX.source,
    example: 'John',
  })
  readonly givenName?: string

  /**
   * The user’s family name, if provided.
   */
  @ApiPropertyOptional({
    title: 'Family Name',
    description: 'Last name of the user.',
    type: String,
    pattern: FAMILY_NAME_REGEX.source,
    example: 'Appleseed',
  })
  readonly familyName?: string

  /**
   * The user’s default nickname, if provided.
   */
  @ApiPropertyOptional({
    title: 'Default Nickname',
    description:
      'A nickname chosen by the user, must be 2 to 20 characters long and contain only letters, numbers, or underscores.',
    required: true,
    type: String,
    minLength: PLAYER_NICKNAME_MIN_LENGTH,
    maxLength: PLAYER_NICKNAME_MAX_LENGTH,
    pattern: PLAYER_NICKNAME_REGEX.source,
    example: 'FrostyBear',
  })
  readonly defaultNickname?: string

  /**
   * The user’s authentication provider.
   */
  @ApiProperty({
    title: 'Authentication Provider',
    description: 'The provider used by the user to authenticate.',
    example: AuthProvider.Local,
    enum: Object.values(AuthProvider),
  })
  readonly authProvider: AuthProvider

  /**
   * ISO 8601 timestamp when the user was created.
   */
  @ApiProperty({
    title: 'Created',
    description: 'Creation timestamp for the created user.',
    type: Date,
    format: 'date-time',
    example: '2025-06-18T12:00:00.000Z',
  })
  readonly created: Date

  /**
   * ISO 8601 timestamp when the user was last updated.
   */
  @ApiProperty({
    title: 'Updated',
    description: 'Last update timestamp for the created user.',
    type: Date,
    format: 'date-time',
    example: '2025-06-18T12:00:00.000Z',
  })
  readonly updated: Date
}
