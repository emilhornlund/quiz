import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsDateString } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `updated` property.
 *
 * This decorator applies validation and API documentation to the `updated` field of a quiz.
 * It ensures that the property:
 * - Is of type `Date`.
 * - Is a valid ISO 8601 date string.
 *
 * Example usage:
 * ```typescript
 * import { QuizUpdatedProperty } from './decorators';
 *
 * export class QuizDto {
 *   @QuizUpdatedProperty()
 *   updated: Date;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to define the OpenAPI documentation for the property.
 * - `@IsDateString` to validate the property as a valid ISO 8601 date string.
 *
 * Description:
 * - The `updated` property specifies the date and time when the quiz was last updated.
 *
 * Example value:
 * - `"2024-11-28T12:34:56.789Z"`
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuizUpdatedProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description: 'The date and time when the quiz was last updated.',
      type: Date,
      format: 'date-time',
      example: '2024-11-28T12:34:56.789Z',
      required: true,
    }),
    IsDateString(
      {},
      {
        message: 'The updated date must be a valid ISO 8601 date string.',
      },
    ),
  )
}
