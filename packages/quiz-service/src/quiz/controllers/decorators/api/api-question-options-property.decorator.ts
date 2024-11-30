import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, ValidateNested } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `options` property.
 *
 * This decorator applies validation and API documentation to the options field,
 * which contains a list of possible answers for a question.
 * It ensures that the property:
 * - Is required.
 * - Is an array of nested `QuestionOptionRequest` objects.
 *
 * Example usage:
 * ```typescript
 * import { ApiQuestionOptionsProperty } from './decorators';
 *
 * export class QuestionDto {
 *   @ApiQuestionOptionsProperty()
 *   options: QuestionOptionRequest[];
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
export function ApiQuestionOptionsProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description: 'The list of possible answers for a question.',
      required: true,
      // type: () => [QuestionOptionRequest],
    }),
    IsArray(),
    ValidateNested({ each: true }),
    // Type(() => [QuestionOptionRequest]),
  )
}
