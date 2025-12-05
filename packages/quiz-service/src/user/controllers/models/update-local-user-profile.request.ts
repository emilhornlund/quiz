import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  AuthProvider,
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  EMAIL_REGEX,
  FAMILY_NAME_MAX_LENGTH,
  FAMILY_NAME_MIN_LENGTH,
  FAMILY_NAME_REGEX,
  GIVEN_NAME_MAX_LENGTH,
  GIVEN_NAME_MIN_LENGTH,
  GIVEN_NAME_REGEX,
  PLAYER_NICKNAME_MAX_LENGTH,
  PLAYER_NICKNAME_MIN_LENGTH,
  PLAYER_NICKNAME_REGEX,
  UpdateLocalUserProfileRequestDto,
} from '@quiz/common'
import {
  IsEnum,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

/**
 * Represents the request object for updating a local user’s profile.
 */
export class UpdateLocalUserProfileRequest implements UpdateLocalUserProfileRequestDto {
  /**
   * The user’s authentication provider, Local for this request dto.
   */
  @ApiProperty({
    title: 'Authentication Provider',
    description: 'The provider used by the user to authenticate.',
    example: AuthProvider.Local,
    enum: [AuthProvider.Local],
  })
  @IsEnum(AuthProvider)
  authProvider: AuthProvider.Local

  /**
   * The user’s email address.
   */
  @ApiPropertyOptional({
    title: 'Email',
    description: 'Email address of the user.',
    type: String,
    pattern: EMAIL_REGEX.source,
    example: 'user@example.com',
  })
  @IsOptional()
  @MinLength(EMAIL_MIN_LENGTH)
  @MaxLength(EMAIL_MAX_LENGTH)
  @Matches(EMAIL_REGEX, {
    message: 'Email must be a valid address.',
  })
  readonly email?: string

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
  @IsOptional()
  @MinLength(GIVEN_NAME_MIN_LENGTH)
  @MaxLength(GIVEN_NAME_MAX_LENGTH)
  @Matches(GIVEN_NAME_REGEX, {
    message:
      'Given name must be 1–64 characters of letters/marks, and may include internal spaces, apostrophes or hyphens (no leading/trailing separators).',
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
  @IsOptional()
  @MinLength(FAMILY_NAME_MIN_LENGTH)
  @MaxLength(FAMILY_NAME_MAX_LENGTH)
  @Matches(FAMILY_NAME_REGEX, {
    message:
      'Family name must be 1–64 characters of letters/marks, and may include internal spaces, apostrophes or hyphens (no leading/trailing separators).',
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
  @IsOptional()
  @MinLength(PLAYER_NICKNAME_MIN_LENGTH)
  @MaxLength(PLAYER_NICKNAME_MAX_LENGTH)
  @Matches(PLAYER_NICKNAME_REGEX, {
    message: 'Nickname can only contain letters, numbers, and underscores.',
  })
  readonly defaultNickname?: string
}
