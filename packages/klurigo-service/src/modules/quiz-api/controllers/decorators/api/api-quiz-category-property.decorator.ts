import { QuizCategory } from '@klurigo/common'
import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'

/**
 * Decorator for documenting and validating the `category` property of a quiz.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsEnum` to ensure the value is a valid `QuizCategory`.
 */
export function ApiQuizCategoryProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Category',
      description: 'Specifies the category of the quiz.',
      enum: Object.values(QuizCategory),
      required: true,
      type: String,
      example: QuizCategory.GeneralKnowledge,
    }),
    IsEnum(QuizCategory, {
      message: 'Category must be valid.',
    }),
  )
}
