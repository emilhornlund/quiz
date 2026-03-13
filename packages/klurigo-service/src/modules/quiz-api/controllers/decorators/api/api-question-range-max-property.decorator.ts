import { QUIZ_RANGE_MAX_VALUE, QUIZ_RANGE_MIN_VALUE } from '@klurigo/common'
import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min, Validate } from 'class-validator'

import { MinMaxValidator } from './min-max-validator.dectorator'

/**
 * Decorator for documenting and validating the `max` property of a range question.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber`, `@Min`, and `@Max` to validate the numeric range.
 * - `@Validate` to ensure max is greater than or equal to min.
 */
export function ApiQuestionRangeMaxProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Max Range',
      description: 'The maximum possible value for the range.',
      example: 100,
      required: true,
      minimum: QUIZ_RANGE_MIN_VALUE,
      maximum: QUIZ_RANGE_MAX_VALUE,
      type: Number,
    }),
    IsNumber(),
    Min(QUIZ_RANGE_MIN_VALUE),
    Max(QUIZ_RANGE_MAX_VALUE),
    Validate(MinMaxValidator, ['min', 'max']),
  )
}
