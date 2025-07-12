import { ApiProperty } from '@nestjs/swagger'
import {
  AuthPasswordResetRequestDto,
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  EMAIL_REGEX,
} from '@quiz/common'
import { Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Request object for resetting a user’s password.
 */
export class AuthPasswordResetRequest implements AuthPasswordResetRequestDto {
  /**
   * The user’s email address.
   */
  @ApiProperty({
    title: 'Email',
    description: 'Unique email address for the user.',
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
}
