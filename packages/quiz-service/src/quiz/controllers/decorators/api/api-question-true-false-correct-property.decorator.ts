import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `correct` property in true/false questions.
 *
 * This decorator applies validation and API documentation to the `correct` field,
 * which indicates whether the statement is correct (`true`) or not (`false`).
 * It ensures that the property:
 * - Is required.
 * - Is a boolean value (`true` or `false`).
 *
 * Example usage:
 * ```typescript
 * import { ApiQuestionTrueFalseCorrectProperty } from './decorators';
 *
 * export class QuestionTrueFalseRequest {
 *   @ApiQuestionTrueFalseCorrectProperty()
 *   correct: boolean;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to include metadata in the OpenAPI documentation.
 * - `@IsBoolean` to enforce the value must be a boolean (`true` or `false`).
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuestionTrueFalseCorrectProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description:
        'Indicates whether the statement is correct (true) or not (false).',
      example: true,
      required: true,
      type: Boolean,
    }),
    IsBoolean(),
  )
}
