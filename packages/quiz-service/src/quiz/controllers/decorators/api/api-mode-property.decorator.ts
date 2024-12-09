import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { GameMode } from '@quiz/common'
import { IsEnum } from 'class-validator'

export function ApiModeProperty(mode?: GameMode) {
  return applyDecorators(
    ApiProperty({
      description: mode
        ? `The game mode, which is set to ${mode} for this request.`
        : 'The game mode of this quiz.',
      required: true,
      enum: mode ? [mode] : GameMode,
    }),
    IsEnum(GameMode),
  )
}
