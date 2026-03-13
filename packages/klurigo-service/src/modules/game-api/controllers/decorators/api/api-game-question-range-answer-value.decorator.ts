import { QUIZ_RANGE_MAX_VALUE, QUIZ_RANGE_MIN_VALUE } from '@klurigo/common'
import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for documenting and validating the `value` property of a range question answer.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to ensure the value is a number.
 * - `@Min` to enforce the minimum value of -10000.
 * - `@Max` to enforce the maximum value of 10000.
 */
export function ApiGameQuestionRangeAnswerValue() {
  return applyDecorators(
    ApiProperty({
      title: 'Value',
      description: 'The submitted value for the range question.',
      example: 50,
      required: true,
      minimum: QUIZ_RANGE_MIN_VALUE,
      maximum: QUIZ_RANGE_MAX_VALUE,
      type: Number,
    }),
    IsNumber(),
    Min(QUIZ_RANGE_MIN_VALUE),
    Max(QUIZ_RANGE_MAX_VALUE),
  )
}
