import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QuizVisibility } from '@quiz/common'
import { IsEnum } from 'class-validator'

/**
 * Decorator for Swagger documentation and validation of the `visibility` property.
 *
 * This decorator applies validation and API documentation to the `visibility` field of a quiz.
 * It ensures that the property:
 * - Is a valid enum value of type `QuizVisibility` (e.g., `public` or `private`).
 *
 * Example usage:
 * ```typescript
 * import { ApiQuizVisibilityProperty } from './decorators';
 *
 * export class CreateQuizDto {
 *   @ApiQuizVisibilityProperty()
 *   visibility: QuizVisibility;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to define the OpenAPI documentation for the property.
 * - `@IsEnum` to ensure the property is a valid `QuizVisibility` enum value and includes a custom validation error message.
 *
 * Description:
 * - The `visibility` property specifies whether the quiz is public or private.
 *
 * Validation:
 * - The property must be one of the defined enum values in `QuizVisibility` (`public` or `private`).
 *
 * Example value:
 * - `public`
 *
 * Swagger Enum Values:
 * - `QuizVisibility.Public`: Represents a public quiz.
 * - `QuizVisibility.Private`: Represents a private quiz.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuizVisibilityProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
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
