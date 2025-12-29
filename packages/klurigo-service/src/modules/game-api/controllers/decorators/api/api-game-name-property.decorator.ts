import {
  QUIZ_TITLE_MAX_LENGTH,
  QUIZ_TITLE_MIN_LENGTH,
  QUIZ_TITLE_REGEX,
} from '@klurigo/common'
import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Decorator for documenting and validating the `name` property of a game.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsString` to ensure the value is a string.
 * - `@MinLength` to enforce the minimum length.
 * - `@MaxLength` to enforce the maximum length.
 * - `@Matches` to enforce the regex pattern.
 */
export function ApiGameNameProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Name',
      description: 'The name of the game.',
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
      message: `The name must match the pattern ${QUIZ_TITLE_REGEX}.`,
    }),
  )
}
