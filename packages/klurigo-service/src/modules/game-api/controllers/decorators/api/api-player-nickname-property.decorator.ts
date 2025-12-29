import {
  PLAYER_NICKNAME_MAX_LENGTH,
  PLAYER_NICKNAME_MIN_LENGTH,
  PLAYER_NICKNAME_REGEX,
} from '@klurigo/common'
import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Decorator for documenting and validating the `nickname` property of a player.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsString` to ensure the value is a string.
 * - `@MinLength` to enforce the minimum length.
 * - `@MaxLength` to enforce the maximum length.
 * - `@Matches` to enforce the regex pattern.
 */
export function ApiPlayerNicknameProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Nickname',
      description:
        'A nickname chosen by the player, must be 2 to 20 characters long and contain only letters, numbers, or underscores.',
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
