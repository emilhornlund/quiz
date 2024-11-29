import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import {
  QUIZ_NAME_MAX_LENGTH,
  QUIZ_NAME_MIN_LENGTH,
  QUIZ_NAME_REGEX,
} from '@quiz/common'
import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `title` property.
 *
 * This decorator applies validation and API documentation to the title field of a quiz.
 * It ensures that the property:
 * - Is a required string.
 * - Has a length between the defined minimum and maximum.
 * - Matches the specified regular expression pattern.
 *
 * Example usage:
 * ```typescript
 * import { QuizTitleProperty } from './decorators';
 *
 * export class CreateQuizDto {
 *   @QuizTitleProperty()
 *   title: string;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to define the OpenAPI documentation for the property.
 * - `@IsString` to ensure the property is a string.
 * - `@MinLength` to enforce a minimum length for the title.
 * - `@MaxLength` to enforce a maximum length for the title.
 * - `@Matches` to ensure the title matches the specified regex pattern.
 *
 * Constants used:
 * - `QUIZ_NAME_MIN_LENGTH`: The minimum allowed length for the title.
 * - `QUIZ_NAME_MAX_LENGTH`: The maximum allowed length for the title.
 * - `QUIZ_NAME_REGEX`: The regex pattern the title must match.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuizTitleProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description: 'The title of the quiz.',
      minLength: QUIZ_NAME_MIN_LENGTH,
      maxLength: QUIZ_NAME_MAX_LENGTH,
      pattern: `${QUIZ_NAME_REGEX}`,
      required: true,
      type: String,
      example: 'Trivia Battle',
    }),
    IsString(),
    MinLength(QUIZ_NAME_MIN_LENGTH),
    MaxLength(QUIZ_NAME_MAX_LENGTH),
    Matches(QUIZ_NAME_REGEX, {
      message: `The title must match the pattern ${QUIZ_NAME_REGEX}.`,
    }),
  )
}
