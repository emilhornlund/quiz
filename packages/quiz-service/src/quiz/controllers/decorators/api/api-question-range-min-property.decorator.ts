import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min, Validate } from 'class-validator'

import { MinMaxValidator } from '../../../../game/controllers/decorators'

/**
 * Decorator for Swagger documentation of the `min` property in range questions.
 *
 * This decorator applies validation and API documentation to the `min` field,
 * which specifies the minimum possible value for the range question.
 * It ensures that the property:
 * - Is required.
 * - Is a number between -10000 and 10000.
 * - Is less than or equal to the `max` value.
 *
 * Example usage:
 * ```typescript
 * import { ApiQuestionRangeMinProperty } from './decorators';
 *
 * export class QuestionRangeRequest {
 *   @ApiQuestionRangeMinProperty()
 *   min: number;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to include metadata in the OpenAPI documentation.
 * - `@IsNumber`, `@Min`, and `@Max` to validate numerical constraints.
 * - `@Validate` with `MinMaxValidator` to ensure `min` is less than or equal to `max`.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuestionRangeMinProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
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
