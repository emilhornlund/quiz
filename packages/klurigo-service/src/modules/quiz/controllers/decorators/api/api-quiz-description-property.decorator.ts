import {
  QUIZ_DESCRIPTION_MAX_LENGTH,
  QUIZ_DESCRIPTION_REGEX,
} from '@klurigo/common'
import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator'

/**
 * Decorator for documenting and validating the optional `description` property of a quiz.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsString` and `@MaxLength` for string validation.
 * - `@IsOptional` to allow omission of this property.
 */
export function ApiQuizDescriptionProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Description',
      description: 'A brief description of the quiz. Optional.',
      type: String,
      required: false,
      pattern: `${QUIZ_DESCRIPTION_REGEX}`,
      maxLength: QUIZ_DESCRIPTION_MAX_LENGTH,
      example: 'A fun and engaging trivia quiz for all ages.',
    }),
    IsString(),
    IsOptional(),
    MaxLength(QUIZ_DESCRIPTION_MAX_LENGTH),
    Matches(QUIZ_DESCRIPTION_REGEX),
  )
}
