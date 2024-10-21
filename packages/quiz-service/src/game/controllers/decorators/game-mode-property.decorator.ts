import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { GameMode } from '@quiz/common'
import { IsEnum } from 'class-validator'

export function GameModeProperty(mode: GameMode) {
  return applyDecorators(
    ApiProperty({
      description: `The game mode, which is set to ${mode} for this request.`,
      required: true,
      enum: [mode],
    }),
    IsEnum(GameMode),
  )
}
