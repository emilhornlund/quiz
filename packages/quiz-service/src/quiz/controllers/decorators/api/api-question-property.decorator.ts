import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

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
      name: 'Text',
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
