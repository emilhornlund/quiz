import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QuizVisibility } from '@quiz/common'
import { IsEnum } from 'class-validator'

/**
 * Decorator for documenting and validating the `visibility` property of a quiz.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsEnum` to ensure the value is either public or private.
 */
export function ApiQuizVisibilityProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Visibility',
      description: 'Specifies whether the quiz is public or private.',
      enum: Object.values(QuizVisibility),
      required: true,
      type: String,
      example: QuizVisibility.Public,
    }),
    IsEnum(QuizVisibility, {
      message: 'Visibility must be either public or private.',
    }),
  )
}
