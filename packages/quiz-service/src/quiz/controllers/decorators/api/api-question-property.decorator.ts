import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `question` property.
 *
 * This decorator applies validation and API documentation to the `question` field,
 * which represents the text of the question.
 * It ensures that the property:
 * - Is required.
 * - Is a string between 3 and 120 characters long.
 *
 * Example usage:
 * ```typescript
 * import { ApiQuestionProperty } from './decorators';
 *
 * export class QuestionRequest {
 *   @ApiQuestionProperty()
 *   question: string;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to include metadata in the OpenAPI documentation.
 * - `@IsString` to enforce the value must be a string.
 * - `@MinLength` and `@MaxLength` to constrain the length of the string.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuestionProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description:
        'The actual question text. Must be between 3 and 120 characters long.',
      example: 'What is the capital of Sweden?',
      required: true,
      minLength: 3,
      maxLength: 120,
      type: String,
    }),
    IsString(),
    MinLength(3),
    MaxLength(120),
  )
}
