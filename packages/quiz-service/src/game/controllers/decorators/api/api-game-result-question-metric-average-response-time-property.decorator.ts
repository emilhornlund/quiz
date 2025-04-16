import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for the average response time field in a question's aggregated metrics.
 *
 * Validates the number value and generates Swagger documentation.
 */
export function ApiGameResultQuestionMetricAverageResponseTimeProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'The average time (in milliseconds) that players took to answer the question.',
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
