import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QuestionType } from '@quiz/common'
import { IsEnum } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `type` property in a question.
 *
 * This decorator applies validation and API documentation to the `type` field,
 * which represents the type of the question.
 * It ensures that the property:
 * - Is required.
 * - Matches one of the values in the `QuestionType` enum.
 *
 * Example usage:
 * ```typescript
 * import { ApiQuestionTypeProperty } from './decorators';
 * import { QuestionType } from '@quiz/common';
 *
 * export class QuestionRequest {
 *   @ApiQuestionTypeProperty({ description: 'The type of the question.' })
 *   type: QuestionType.MultiChoice;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to include metadata in the OpenAPI documentation.
 * - `@IsEnum` to validate that the value matches a specific enum value.
 *
 * @param options - The options for this decorator.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuestionTypeProperty(options?: {
  description?: string
  explicitType?: QuestionType
}): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description: options?.description ?? 'The type of the question.',
      enum: [options?.explicitType ?? QuestionType],
      example: options?.explicitType ?? QuestionType.MultiChoice,
      required: true,
      type: String,
    }),
    IsEnum(QuestionType),
  )
}
