import {
  AuthPasswordResetRequestDto,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
} from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'
import { Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Request object for resetting a user’s password.
 */
export class AuthPasswordResetRequest implements AuthPasswordResetRequestDto {
  /**
   * The new password the user wants to set.
   */
  @ApiProperty({
    title: 'Password',
    description: 'Strong password meeting complexity requirements.',
    type: String,
    pattern: PASSWORD_REGEX.source,
    example: 'Super#SecretPa$$w0rd123',
  })
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must include ≥2 uppercase, ≥2 lowercase, ≥2 digits, ≥2 symbols.',
  })
  readonly password: string
}
