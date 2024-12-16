import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray } from 'class-validator'

/**
 * Decorator for Swagger documentation of typed answers `options` property.
 *
 * This decorator applies validation and API documentation to the options field,
 * which contains a list of possible answers for a type answer question.
 * It ensures that the property:
 * - Is required.
 * - Is an array of nested `string` objects.
 *
 * Example usage:
 * ```typescript
 * import { ApiQuestionTypeAnswerOptionsProperty } from './decorators';
 *
 * export class QuestionDto {
 *   @ApiQuestionTypeAnswerOptionsProperty()
 *   options: string[];
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to include metadata in the OpenAPI documentation.
 * - `@IsArray` to enforce the value must be an array.
 * - `@ValidateNested` to validate each object within the array.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuestionTypeAnswerOptionsProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description: 'The list of possible typed answers for a question.',
      required: true,
      type: [String],
    }),
    IsArray(),
  )
}
