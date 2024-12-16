import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min, Validate } from 'class-validator'

import { MinMaxValidator } from './min-max-validator.dectorator'

/**
 * Decorator for Swagger documentation of the `max` property in range questions.
 *
 * This decorator applies validation and API documentation to the `max` field,
 * which specifies the maximum possible value for the range question.
 * It ensures that the property:
 * - Is required.
 * - Is a number between -10000 and 10000.
 * - Is greater than or equal to the `min` value.
 *
 * Example usage:
 * ```typescript
 * import { ApiQuestionRangeMaxProperty } from './decorators';
 *
 * export class QuestionRangeRequest {
 *   @ApiQuestionRangeMaxProperty()
 *   max: number;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to include metadata in the OpenAPI documentation.
 * - `@IsNumber`, `@Min`, and `@Max` to validate numerical constraints.
 * - `@Validate` with `MinMaxValidator` to ensure `max` is greater than or equal to `min`.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuestionRangeMaxProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
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
