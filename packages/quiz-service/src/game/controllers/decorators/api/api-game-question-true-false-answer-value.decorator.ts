import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

/**
 * Decorator for documenting and validating the `value` property of a true/false answer.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsBoolean` to ensure the value is a boolean.
 */
export function ApiGameQuestionTrueFalseAnswerValue() {
  return applyDecorators(
    ApiProperty({
      title: 'Value',
      description: 'The submitted answer to the true false question.',
      example: true,
      required: true,
      type: Boolean,
    }),
    IsBoolean(),
  )
}
