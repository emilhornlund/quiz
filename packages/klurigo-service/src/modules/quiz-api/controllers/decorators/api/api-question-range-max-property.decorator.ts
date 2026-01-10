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
      minimum: -10000,
      maximum: 10000,
      type: Number,
    }),
    IsNumber(),
    Min(-10000),
    Max(10000),
    Validate(MinMaxValidator, ['min', 'max']),
  )
}
