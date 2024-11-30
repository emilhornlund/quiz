import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `correct` property in a question option.
 *
 * This decorator applies validation and API documentation to the `correct` field,
 * which indicates whether the option is the correct answer.
 * It ensures that the property:
 * - Is required.
 * - Is a boolean value.
 *
 * Example usage:
 * ```typescript
 * import { ApiQuestionOptionCorrectProperty } from './decorators';
 *
 * export class QuestionOptionRequest {
 *   @ApiQuestionOptionCorrectProperty()
 *   correct: boolean;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to include metadata in the OpenAPI documentation.
 * - `@IsBoolean` to enforce the value must be a boolean.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuestionOptionCorrectProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description: 'Indicates whether this answer is correct or not.',
      example: true,
      required: true,
      type: Boolean,
    }),
    IsBoolean(),
  )
}
