import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QUIZ_DESCRIPTION_MAX_LENGTH } from '@quiz/common'
import { IsOptional, IsString, MaxLength } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `description` property.
 *
 * This decorator applies validation and API documentation to the description field of a quiz.
 * It ensures that the property:
 * - Is an optional string.
 * - Has a length that does not exceed the defined maximum.
 *
 * Example usage:
 * ```typescript
 * import { QuizDescriptionProperty } from './decorators';
 *
 * export class CreateQuizDto {
 *   @QuizDescriptionProperty()
 *   description?: string;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to define the OpenAPI documentation for the property.
 * - `@IsString` to ensure the property is a string.
 * - `@IsOptional` to indicate that the property is not required.
 * - `@MaxLength` to enforce a maximum length for the description.
 *
 * Constants used:
 * - `QUIZ_DESCRIPTION_MAX_LENGTH`: The maximum allowed length for the description.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuizDescriptionProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description: 'A brief description of the quiz. Optional.',
      maxLength: QUIZ_DESCRIPTION_MAX_LENGTH,
      required: false,
      type: String,
      example: 'A fun and engaging trivia quiz for all ages.',
    }),
    IsString(),
    IsOptional(),
    MaxLength(QUIZ_DESCRIPTION_MAX_LENGTH),
  )
}
