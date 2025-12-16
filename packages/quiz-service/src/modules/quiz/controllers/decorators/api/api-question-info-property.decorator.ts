import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import {
  QUIZ_QUESTION_INFO_MAX_LENGTH,
  QUIZ_QUESTION_INFO_MIN_LENGTH,
  QUIZ_QUESTION_INFO_REGEX,
} from '@quiz/common'
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

/**
 * Decorator for documenting and validating the `info` property.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsOptional` to allow the property to be omitted.
 * - `@IsString` to validate the value as a string.
 * - `@MinLength` and `@MaxLength` to enforce character limits.
 * - `@Matches` to validate allowed characters via regex.
 */
export function ApiQuestionInfoProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      name: 'Info',
      description:
        'Optional info text shown with the question result/review (explanation, fun fact, or source).',
      example:
        'Mount Everest grows a few millimeters every year due to tectonic activity.',
      required: false,
      pattern: QUIZ_QUESTION_INFO_REGEX.source,
      minLength: QUIZ_QUESTION_INFO_MIN_LENGTH,
      maxLength: QUIZ_QUESTION_INFO_MAX_LENGTH,
      type: String,
    }),
    IsOptional(),
    IsString(),
    MinLength(QUIZ_QUESTION_INFO_MIN_LENGTH),
    MaxLength(QUIZ_QUESTION_INFO_MAX_LENGTH),
    Matches(QUIZ_QUESTION_INFO_REGEX),
  )
}
