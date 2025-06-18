import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  CreateUserRequestDto,
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  EMAIL_REGEX,
  FAMILY_NAME_MAX_LENGTH,
  FAMILY_NAME_MIN_LENGTH,
  FAMILY_NAME_REGEX,
  GIVEN_NAME_MAX_LENGTH,
  GIVEN_NAME_MIN_LENGTH,
  GIVEN_NAME_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
} from '@quiz/common'
import { IsOptional, Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Request object for creating a new user account.
 */
export class CreateUserRequest implements CreateUserRequestDto {
  /**
   * The user’s email address.
   */
  @ApiProperty({
    title: 'Email',
    description: 'Unique email address for the new user.',
    type: String,
    pattern: EMAIL_REGEX.source,
    example: 'user@example.com',
  })
  @MinLength(EMAIL_MIN_LENGTH)
  @MaxLength(EMAIL_MAX_LENGTH)
  @Matches(EMAIL_REGEX, {
    message: 'Email must be a valid address.',
  })
  readonly email: string

  /**
   * The user’s password.
   */
  @ApiProperty({
    title: 'Password',
    description: 'Strong password meeting complexity requirements.',
    type: String,
    pattern: PASSWORD_REGEX.source,
    example: 'Super#SecretPassw0rd123',
  })
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must include ≥2 uppercase, ≥2 lowercase, ≥2 digits, ≥2 symbols.',
  })
  readonly password: string

  /**
   * Optional first name of the user.
   */
  @ApiPropertyOptional({
    title: 'Given Name',
    description: 'First name of the user, if provided.',
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
   * Optional last name of the user (1–50 alphabetic chars).
   */
  @ApiPropertyOptional({
    title: 'Family Name',
    description: 'Last name of the user, if provided.',
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
}
