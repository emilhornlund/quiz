import { ApiProperty } from '@nestjs/swagger'
import {
  AuthPasswordChangeRequestDto,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
} from '@quiz/common'
import { Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Request object for changing a user’s password.
 *
 * Contains the user’s current password (for verification) and the new password to set.
 */
export class AuthPasswordChangeRequest implements AuthPasswordChangeRequestDto {
  /**
   * The user’s current password, used to verify their identity before allowing a change.
   */
  @ApiProperty({
    title: 'Old Password',
    description:
      'The user’s existing password; must match their current credentials.',
    type: String,
    pattern: PASSWORD_REGEX.source,
    example: 'Super#SecretPa$$w0rd123',
  })
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @Matches(PASSWORD_REGEX, {
    message:
      'Old password must include at least 2 uppercase letters, 2 lowercase letters, 2 digits, and 2 symbols.',
  })
  readonly oldPassword: string

  /**
   * The new password the user wants to set.
   * Must meet complexity requirements: 8–128 chars, ≥2 uppercase, ≥2 lowercase, ≥2 digits, ≥2 symbols.
   */
  @ApiProperty({
    title: 'New Password',
    description:
      'The new password to apply; 8–128 chars, min 2 uppercase, 2 lowercase, 2 digits, 2 symbols.',
    type: String,
    pattern: PASSWORD_REGEX.source,
    example: 'Tr0ub4dor&3NewP@ssw0rd!',
  })
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @Matches(PASSWORD_REGEX, {
    message:
      'New password must include at least 2 uppercase letters, 2 lowercase letters, 2 digits, and 2 symbols.',
  })
  readonly newPassword: string
}
