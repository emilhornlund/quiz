import { ApiProperty } from '@nestjs/swagger'
import {
  MIGRATION_TOKEN_LENGTH,
  MIGRATION_TOKEN_REGEX,
  UserMigrationRequestDto,
} from '@quiz/common'
import { Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Request payload for migrating a legacy anonymous player
 * to the authenticated user account.
 */
export class UserMigrationRequest implements UserMigrationRequestDto {
  /**
   * Migration token identifying the legacy anonymous player.
   */
  @ApiProperty({
    title: 'Migration Token',
    description:
      'A 43‑character base64url-encoded token that identifies the legacy anonymous player.',
    type: String,
    pattern: MIGRATION_TOKEN_REGEX.source,
    example: 'jU4n2n9eC-8GEZhk8NcApcfNQF9xO0yQOeJUZQk4w-E',
  })
  @MinLength(MIGRATION_TOKEN_LENGTH)
  @MaxLength(MIGRATION_TOKEN_LENGTH)
  @Matches(MIGRATION_TOKEN_REGEX, {
    message:
      'migrationToken must be a 43-character base64url string (A–Z, a–z, 0–9, _ or -).',
  })
  readonly migrationToken: string
}
