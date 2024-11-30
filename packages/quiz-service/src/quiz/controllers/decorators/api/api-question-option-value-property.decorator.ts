import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `value` property in a question option.
 *
 * This decorator applies validation and API documentation to the value field,
 * which represents the text of a possible answer.
 * It ensures that the property:
 * - Is required.
 * - Is a string between 1 and 75 characters long.
 *
 * Example usage:
 * ```typescript
 * import { QuestionOptionValueProperty } from './decorators';
 *
 * export class QuestionOptionRequest {
 *   @QuestionOptionValueProperty()
 *   value: string;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to include metadata in the OpenAPI documentation.
 * - `@IsString` to enforce the value must be a string.
 * - `@MinLength` and `@MaxLength` to constrain the length of the string.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function QuestionOptionValueProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description:
        'The text of the answer. Must be between 1 and 75 characters long.',
      example: 'Paris',
      required: true,
      minLength: 1,
      maxLength: 75,
      type: String,
    }),
    IsString(),
    MinLength(1),
    MaxLength(75),
  )
}
