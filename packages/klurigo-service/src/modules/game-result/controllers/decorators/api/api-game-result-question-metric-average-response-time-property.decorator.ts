import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for documenting and validating the `averageResponseTime` metric for a question.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to ensure the value is a number.
 * - `@Min` to enforce a minimum of 0 milliseconds.
 * - `@Max` to enforce a maximum of 600000 milliseconds.
 */
export function ApiGameResultQuestionMetricAverageResponseTimeProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Average Response Time',
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
