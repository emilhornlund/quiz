import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for documenting and validating the `optionIndex` property of a multi-choice answer.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to ensure the value is a number.
 * - `@Min` to enforce the minimum value of 0.
 * - `@Max` to enforce the maximum value of 5.
 */
export function ApiGameQuestionMultiChoiceAnswerOptionIndex() {
  return applyDecorators(
    ApiProperty({
      title: 'Option Index',
      description: 'The submitted option index for the multi option question.',
      example: 0,
      required: true,
      minimum: 0,
      maximum: 5,
      type: Number,
    }),
    IsNumber(),
    Min(0),
    Max(5),
  )
}
