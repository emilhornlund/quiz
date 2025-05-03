import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

/**
 * Decorator for documenting and validating the `correct` property of a true/false question.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsBoolean` to validate the value as a boolean.
 */
export function ApiQuestionTrueFalseCorrectProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Correct',
      description:
        'Indicates whether the statement is correct (true) or not (false).',
      example: true,
      required: true,
      type: Boolean,
    }),
    IsBoolean(),
  )
}
