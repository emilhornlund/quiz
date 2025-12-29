import { QuestionPinTolerance } from '@klurigo/common'
import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'

/**
 * Decorator for documenting and validating the `tolerance` property in Pin questions.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsEnum` to enforce one of the defined `QuestionPinTolerance` values.
 */
export function ApiQuestionPinToleranceProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Tolerance',
      description: 'Allowed distance preset around the correct point.',
      enum: QuestionPinTolerance,
      example: QuestionPinTolerance.Medium,
      required: true,
      type: String,
    }),
    IsEnum(QuestionPinTolerance),
  )
}
