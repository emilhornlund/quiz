import { GameStatus } from '@klurigo/common'
import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'

/**
 * Decorator for documenting and validating the `status` property of a game.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsEnum` to ensure the value is a valid game status.
 */
export function ApiGameStatusProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Status',
      description: 'The status of the game.',
      enum: GameStatus,
      required: true,
      example: GameStatus.Completed,
    }),
    IsEnum(GameStatus),
  )
}
