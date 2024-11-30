import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsDateString } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `created` property.
 *
 * This decorator applies validation and API documentation to the `created` field of a question.
 * It ensures that the property:
 * - Is of type `Date`.
 * - Is a valid ISO 8601 date string.
 *
 * Example usage:
 * ```typescript
 * import { ApiQuestionCreatedProperty } from './decorators';
 *
 * export class QuestionDto {
 *   @ApiQuestionCreatedProperty()
 *   created: Date;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to define the OpenAPI documentation for the property.
 * - `@IsDateString` to validate the property as a valid ISO 8601 date string.
 *
 * Description:
 * - The `created` property specifies the date and time when the question was created.
 *
 * Example value:
 * - `"2024-11-28T12:34:56.789Z"`
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuestionCreatedProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description: 'The date and time when the question was created.',
      type: Date,
      format: 'date-time',
      example: '2024-11-28T12:34:56.789Z',
      required: true,
    }),
    IsDateString(
      {},
      {
        message: 'The created date must be a valid ISO 8601 date string.',
      },
    ),
  )
}
