import {
  QUIZ_QUESTION_TEXT_MAX_LENGTH,
  QUIZ_QUESTION_TEXT_MIN_LENGTH,
  QUIZ_QUESTION_TEXT_REGEX,
} from '@klurigo/common'
import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Decorator for documenting and validating the `text` property of a question.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsString` to validate the value as a string.
 * - `@MinLength` and `@MaxLength` to enforce character limits.
 */
export function ApiQuestionProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Text',
      description: `The actual question text. Must be between ${QUIZ_QUESTION_TEXT_MIN_LENGTH} and ${QUIZ_QUESTION_TEXT_MAX_LENGTH} characters long.`,
      example: 'What is the capital of Sweden?',
      required: true,
      pattern: `${QUIZ_QUESTION_TEXT_REGEX}`,
      minLength: QUIZ_QUESTION_TEXT_MIN_LENGTH,
      maxLength: QUIZ_QUESTION_TEXT_MAX_LENGTH,
      type: String,
    }),
    IsString(),
    MinLength(QUIZ_QUESTION_TEXT_MIN_LENGTH),
    MaxLength(QUIZ_QUESTION_TEXT_MAX_LENGTH),
    Matches(QUIZ_QUESTION_TEXT_REGEX),
  )
}
