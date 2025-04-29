import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { GameStatus } from '@quiz/common'
import { IsEnum } from 'class-validator'

/**
 * Decorator for documenting and validating a game's status.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsEnum` to validate that the property is one of the defined enum values.
 */
export function ApiGameStatusProperty() {
  return applyDecorators(
    ApiProperty({
      description: 'The status of the game.',
      enum: GameStatus,
      required: true,
      example: GameStatus.Completed,
    }),
    IsEnum(GameStatus),
  )
}
