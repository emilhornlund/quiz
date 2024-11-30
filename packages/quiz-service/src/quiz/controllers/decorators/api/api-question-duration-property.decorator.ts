import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNumber } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `duration` property.
 *
 * This decorator applies validation and API documentation to the question duration field.
 * It ensures that the property:
 * - Is required.
 * - Is a number.
 * - Is one of the allowed values: 5, 30, 60, or 120 seconds.
 *
 * Example usage:
 * ```typescript
 * import { ApiQuestionDurationProperty } from './decorators';
 *
 * export class QuestionDto {
 *   @ApiQuestionDurationProperty()
 *   duration: number;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to include metadata in the OpenAPI documentation.
 * - `@IsNumber` to enforce the value must be a number.
 * - `@IsIn` to restrict the value to a predefined set of allowed values.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuestionDurationProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description:
        'The time limit for answering the question, in seconds. The allowed values are 5, 30, 60, or 120.',
      example: '30',
      required: true,
      enum: [5, 30, 60, 120],
    }),
    IsNumber(),
    IsIn([5, 30, 60, 120]),
  )
}
