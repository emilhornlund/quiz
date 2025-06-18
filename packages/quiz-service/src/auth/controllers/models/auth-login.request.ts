import { ApiProperty } from '@nestjs/swagger'
import {
  AuthLoginRequestDto,
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  EMAIL_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
} from '@quiz/common'
import { Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Request object for user login.
 */
export class AuthLoginRequest implements AuthLoginRequestDto {
  /**
   * The user’s email address for login.
   */
  @ApiProperty({
    title: 'Email',
    description: 'User email to authenticate.',
    type: String,
    pattern: `${EMAIL_REGEX}`,
    example: 'user@example.com',
  })
  @MinLength(EMAIL_MIN_LENGTH)
  @MaxLength(EMAIL_MAX_LENGTH)
  @Matches(EMAIL_REGEX, {
    message: 'Email must be a valid address.',
  })
  readonly email: string

  /**
   * The user’s password for login.
   */
  @ApiProperty({
    title: 'Password',
    description:
      'User password; 8–128 chars, min 2 uppercase, 2 lowercase, 2 digits, 2 symbols.',
    type: String,
    pattern: `${PASSWORD_REGEX}`,
    example: 'Super#SecretPassw0rd123',
  })
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must include ≥2 uppercase, ≥2 lowercase, ≥2 digits, ≥2 symbols.',
  })
  readonly password: string
}
