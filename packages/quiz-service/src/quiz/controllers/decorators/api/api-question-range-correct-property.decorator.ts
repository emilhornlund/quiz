import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min, Validate } from 'class-validator'

import { InRangeValidator } from '../../../../game/controllers/decorators'

/**
 * Decorator for Swagger documentation of the `correct` property in range questions.
 *
 * This decorator applies validation and API documentation to the `correct` field,
 * which specifies the correct value for the range question. The value must fall within
 * the `min` and `max` range and adhere to additional constraints.
 *
 * Example usage:
 * ```typescript
 * import { ApiQuestionRangeCorrectProperty } from './decorators';
 *
 * export class QuestionRangeRequest {
 *   @ApiQuestionRangeCorrectProperty()
 *   correct: number;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to include metadata in the OpenAPI documentation.
 * - `@IsNumber`, `@Min`, and `@Max` to validate numerical constraints.
 * - `@Validate` with `InRangeValidator` to ensure the value is within the range.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuestionRangeCorrectProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description:
        'The correct value for the range question, which must be within the range of min and max.',
      example: 50,
      required: true,
      minimum: -10000,
      maximum: 10000,
      type: Number,
    }),
    IsNumber(),
    Min(-10000),
    Max(10000),
    Validate(InRangeValidator, ['correct', 'min', 'max']),
  )
}
