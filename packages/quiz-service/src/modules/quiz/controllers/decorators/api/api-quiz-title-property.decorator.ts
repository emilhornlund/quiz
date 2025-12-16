import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import {
  QUIZ_TITLE_MAX_LENGTH,
  QUIZ_TITLE_MIN_LENGTH,
  QUIZ_TITLE_REGEX,
} from '@quiz/common'
import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Decorator for documenting and validating the `title` property of a quiz.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsString`, `@MinLength`, `@MaxLength`, and `@Matches` for string validation.
 */
export function ApiQuizTitleProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Title',
      description: 'The title of the quiz.',
      minLength: QUIZ_TITLE_MIN_LENGTH,
      maxLength: QUIZ_TITLE_MAX_LENGTH,
      pattern: `${QUIZ_TITLE_REGEX}`,
      required: true,
      type: String,
      example: 'Trivia Battle',
    }),
    IsString(),
    MinLength(QUIZ_TITLE_MIN_LENGTH),
    MaxLength(QUIZ_TITLE_MAX_LENGTH),
    Matches(QUIZ_TITLE_REGEX, {
      message: `The title must match the pattern ${QUIZ_TITLE_REGEX}.`,
    }),
  )
}
