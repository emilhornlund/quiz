import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNumber } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `points` property.
 *
 * This decorator applies validation and API documentation to the question points field.
 * It ensures that the property:
 * - Is required.
 * - Is a number.
 * - Is one of the allowed values: 0, 1000, or 2000 points.
 *
 * Example usage:
 * ```typescript
 * import { ApiQuestionPointsProperty } from './decorators';
 *
 * export class QuestionDto {
 *   @ApiQuestionPointsProperty()
 *   points: number;
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
export function ApiQuestionPointsProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description:
        'The number of points awarded for a correct answer. The allowed values are 0, 1000, or 2000.',
      example: '1000',
      required: true,
      enum: [0, 1000, 2000],
    }),
    IsNumber(),
    IsIn([0, 1000, 2000]),
  )
}
