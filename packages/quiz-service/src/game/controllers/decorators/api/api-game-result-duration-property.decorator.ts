import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for documenting and validating the `duration` property of a game result.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to ensure the value is a number.
 * - `@Min` to enforce the minimum value of 0.
 * - `@Max` to enforce the maximum value of 7200.
 */
export function ApiGameResultDurationProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Duration',
      description: 'The duration in seconds the game session was active.',
      required: true,
      type: Number,
      minimum: 0,
      maximum: 7200,
      example: 420,
    }),
    IsNumber(
      {},
      {
        message: 'The duration must be a valid number.',
      },
    ),
    Min(0),
    Max(7200),
  )
}
