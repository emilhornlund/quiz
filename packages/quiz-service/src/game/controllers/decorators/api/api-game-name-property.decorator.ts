import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import {
  QUIZ_TITLE_MAX_LENGTH,
  QUIZ_TITLE_MIN_LENGTH,
  QUIZ_TITLE_REGEX,
} from '@quiz/common'
import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Decorator for documenting and validating the game's name.
 *
 * Applies:
 * - `@ApiProperty` to define the OpenAPI documentation for the property.
 * - `@IsString` to ensure the property is a string.
 * - `@MinLength` to enforce a minimum length for the title.
 * - `@MaxLength` to enforce a maximum length for the title.
 * - `@Matches` to ensure the name matches the specified regex pattern.
 */
export function ApiGameNameProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
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
