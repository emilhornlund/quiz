import { QUIZ_RANGE_MAX_VALUE, QUIZ_RANGE_MIN_VALUE } from '@klurigo/common'
import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min, Validate } from 'class-validator'

import { MinMaxValidator } from './min-max-validator.dectorator'

/**
 * Decorator for documenting and validating the `min` property of a range question.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber`, `@Min`, and `@Max` to validate the numeric range.
 * - `@Validate` to ensure min is less than or equal to max.
 */
export function ApiQuestionRangeMinProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Min Range',
      description: 'The minimum possible value for the range.',
      example: 0,
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
