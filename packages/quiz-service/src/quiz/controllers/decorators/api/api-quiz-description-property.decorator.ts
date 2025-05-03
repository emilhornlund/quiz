import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QUIZ_DESCRIPTION_MAX_LENGTH } from '@quiz/common'
import { IsOptional, IsString, MaxLength } from 'class-validator'

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
