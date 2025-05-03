import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { GameMode } from '@quiz/common'
import { IsEnum } from 'class-validator'

/**
 * Decorator for documenting and validating the `mode` property of a game.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsEnum` to validate the value as a game mode.
 */
export function ApiGameModeProperty(mode?: GameMode) {
  return applyDecorators(
    ApiProperty({
      title: 'Game Mode',
      description: mode
        ? `The game mode, which is set to ${mode} for this request.`
        : 'The game mode of this quiz.',
      required: true,
      enum: mode ? [mode] : GameMode,
    }),
    IsEnum(GameMode),
  )
}
