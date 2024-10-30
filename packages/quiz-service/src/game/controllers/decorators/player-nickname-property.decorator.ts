import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { PLAYER_NICKNAME_REGEX } from '@quiz/common'
import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

export function PlayerNicknameProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'A nickname chosen by the player, must be 2 to 20 characters long and contain only letters, numbers, or underscores.',
      required: true,
      type: String,
      minLength: 2,
      maxLength: 20,
      pattern: `${PLAYER_NICKNAME_REGEX}`,
      example: 'FrostyBear',
    }),
    IsString(),
    MinLength(2),
    MaxLength(20),
    Matches(PLAYER_NICKNAME_REGEX, {
      message: 'Nickname can only contain letters, numbers, and underscores.',
    }),
  )
}
