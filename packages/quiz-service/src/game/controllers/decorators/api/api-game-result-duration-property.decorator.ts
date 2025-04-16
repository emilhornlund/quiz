import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for the `duration` field in game result responses.
 *
 * Validates that the duration is a number (in seconds) and documents it in Swagger.
 */
export function ApiGameResultDurationProperty() {
  return applyDecorators(
    ApiProperty({
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
