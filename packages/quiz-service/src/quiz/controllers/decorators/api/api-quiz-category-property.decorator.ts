import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QuizCategory } from '@quiz/common'
import { IsEnum } from 'class-validator'

/**
 * Decorator for Swagger documentation and validation of the `category` property.
 *
 * This decorator applies validation and API documentation to the `category` field of a quiz.
 * It ensures that the property:
 * - Is a valid enum value of type `QuizCategory`.
 *
 * Example usage:
 * ```typescript
 * import { ApiQuizCategoryProperty } from './decorators';
 *
 * export class CreateQuizDto {
 *   @ApiQuizCategoryProperty()
 *   category: QuizCategory;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to define the OpenAPI documentation for the property.
 * - `@IsEnum` to ensure the property is a valid `QuizCategory` enum value and includes a custom validation error message.
 *
 * Description:
 * - The `category` property specifies the category of the quiz.
 *
 * Validation:
 * - The property must be one of the defined enum values in `QuizCategory`.
 *
 * Example value:
 * - `GeneralKnowledge`
 *
 * Swagger Enum Values:
 * - `QuizCategory.GeneralKnowledge`: Represents a general knowledge quiz.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuizCategoryProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
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
