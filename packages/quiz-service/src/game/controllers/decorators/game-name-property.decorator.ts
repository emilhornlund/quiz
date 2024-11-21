import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { GAME_NAME_REGEX } from '@quiz/common'
import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

export function GameNameProperty(options?: { example: string }) {
  return applyDecorators(
    ApiProperty({
      description: 'The name of the game. Must be between 3 and 25 characters.',
      example: options?.example,
      minLength: 3,
      maxLength: 25,
      required: true,
      type: String,
    }),
    IsString(),
    MinLength(3),
    MaxLength(25),
    Matches(GAME_NAME_REGEX, {
      message:
        'The name of the game can only contain letters, numbers, and underscores.',
    }),
  )
}
