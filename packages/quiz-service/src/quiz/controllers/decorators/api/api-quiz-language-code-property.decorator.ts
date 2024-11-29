import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { LanguageCode } from '@quiz/common'
import { IsEnum } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `languageCode` property.
 *
 * This decorator applies validation and API documentation to the `languageCode` field of a quiz.
 * It ensures that the property:
 * - Is a valid enum value from the `LanguageCode` enum.
 *
 * Example usage:
 * ```typescript
 * import { QuizLanguageCodeProperty } from './decorators';
 *
 * export class CreateQuizDto {
 *   @QuizLanguageCodeProperty()
 *   languageCode: LanguageCode;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to define the OpenAPI documentation for the property.
 * - `@IsEnum` to validate that the property is one of the defined enum values.
 *
 * Description:
 * - The `languageCode` property specifies the language in which the quiz is written.
 *
 * Validation:
 * - The property must be a valid enum value of the `LanguageCode` enum.
 * - Includes a custom validation message if the value is not valid.
 *
 * Example value:
 * - `LanguageCode.English`
 *
 * OpenAPI Enum:
 * - The available values for the `languageCode` field are dynamically derived from the `LanguageCode` enum.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuizLanguageCodeProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description: 'The language code of the quiz.',
      enum: Object.values(LanguageCode),
      required: true,
      type: String,
      example: LanguageCode.English,
    }),
    IsEnum(LanguageCode, {
      message: 'The language code must be a valid language code.',
    }),
  )
}
