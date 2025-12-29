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
