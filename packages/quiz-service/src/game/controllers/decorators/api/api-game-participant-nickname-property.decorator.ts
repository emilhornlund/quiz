import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import {
  PLAYER_NICKNAME_MAX_LENGTH,
  PLAYER_NICKNAME_MIN_LENGTH,
  PLAYER_NICKNAME_REGEX,
} from '@quiz/common'
import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Decorator for documenting and validating the `nickname` property of a participant.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsString` to ensure the value is a string.
 * - `@MinLength` to enforce the minimum length.
 * - `@MaxLength` to enforce the maximum length.
 * - `@Matches` to enforce the regex pattern.
 */
export function ApiGameParticipantNicknameProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Nickname',
      description: 'The nickname of the participant.',
      required: true,
      type: String,
      minLength: PLAYER_NICKNAME_MIN_LENGTH,
      maxLength: PLAYER_NICKNAME_MAX_LENGTH,
      pattern: `${PLAYER_NICKNAME_REGEX}`,
      example: 'FrostyBear',
    }),
    IsString(),
    MinLength(PLAYER_NICKNAME_MIN_LENGTH),
    MaxLength(PLAYER_NICKNAME_MAX_LENGTH),
    Matches(PLAYER_NICKNAME_REGEX, {
      message: 'Nickname can only contain letters, numbers, and underscores.',
    }),
  )
}
