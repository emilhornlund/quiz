import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

/**
 * Decorator for documenting and validating the `correct` property of a question option.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsBoolean` to validate the value as a boolean.
 */
export function ApiQuestionOptionCorrectProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Correct',
      description: 'Indicates whether this answer is correct or not.',
      example: true,
      required: true,
      type: Boolean,
    }),
    IsBoolean(),
  )
}
