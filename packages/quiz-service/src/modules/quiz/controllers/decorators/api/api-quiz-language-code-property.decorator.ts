import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { LanguageCode } from '@quiz/common'
import { IsEnum } from 'class-validator'

/**
 * Decorator for documenting and validating the `languageCode` property of a quiz.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsEnum` to ensure the value is a valid `LanguageCode`.
 */
export function ApiQuizLanguageCodeProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Language Code',
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
