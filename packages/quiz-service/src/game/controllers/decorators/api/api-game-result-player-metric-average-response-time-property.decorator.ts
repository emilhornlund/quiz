import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for the average response time field in a player's performance metrics.
 *
 * Validates that the value is a number and provides Swagger documentation.
 */
export function ApiGameResultPlayerMetricAverageResponseTimeProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'The average time (in milliseconds) the player took to answer questions.',
      required: true,
      type: Number,
      minimum: 0,
      maximum: 600000,
      example: 3200,
    }),
    IsNumber(),
    Min(0),
    Max(600000),
  )
}
