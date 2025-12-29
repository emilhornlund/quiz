import { QuestionType } from '@klurigo/common'
import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'

/**
 * Decorator for documenting and validating the `type` property of a question.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsEnum` to validate the value as a valid question type.
 */
export function ApiQuestionTypeProperty(options?: {
  description?: string
  explicitType?: QuestionType
}): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Type',
      description: options?.description ?? 'The type of the question.',
      enum: [options?.explicitType ?? QuestionType],
      example: options?.explicitType ?? QuestionType.MultiChoice,
      required: true,
      type: String,
    }),
    IsEnum(QuestionType),
  )
}
