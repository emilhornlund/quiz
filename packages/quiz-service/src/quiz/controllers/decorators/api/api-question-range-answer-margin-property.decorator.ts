import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QuestionRangeAnswerMargin } from '@quiz/common'
import { IsEnum } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `margin` property in range questions.
 *
 * This decorator applies validation and API documentation to the `margin` field,
 * which specifies the allowed margin of error for a range question.
 * It ensures that the property:
 * - Is required.
 * - Matches one of the values in the `QuestionRangeAnswerMargin` enum.
 *
 * Example usage:
 * ```typescript
 * import { ApiQuestionRangeAnswerMarginProperty } from './decorators';
 *
 * export class QuestionRangeRequest {
 *   @ApiQuestionRangeAnswerMarginProperty()
 *   margin: QuestionRangeAnswerMargin;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to include metadata in the OpenAPI documentation.
 * - `@IsEnum` to validate that the value matches a specific enum value.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuestionRangeAnswerMarginProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description:
        'Specifies the margin of error allowed for a range question. Determines how close a player’s answer must be to the correct value to be considered correct or partially correct. The margin can be one of the following:\n' +
        '- `None`: Only the exact correct answer is accepted.\n' +
        '- `Low`: Accepts answers within 5% of the correct value.\n' +
        '- `Medium`: Accepts answers within 10% of the correct value.\n' +
        '- `High`: Accepts answers within 20% of the correct value.\n' +
        '- `Maximum`: Accepts all answers, with closer answers earning higher precision scores.',
      enum: [QuestionRangeAnswerMargin],
      example: QuestionRangeAnswerMargin.Medium,
      required: true,
      type: String,
    }),
    IsEnum(QuestionRangeAnswerMargin),
  )
}
