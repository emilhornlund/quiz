import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import {
  QUIZ_MULTI_CHOICE_OPTION_VALUE_MAX_LENGTH,
  QUIZ_MULTI_CHOICE_OPTION_VALUE_MIN_LENGTH,
  QUIZ_MULTI_CHOICE_OPTION_VALUE_REGEX,
} from '@quiz/common'
import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Decorator for documenting and validating the `value` property of a multiple choice option.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsString` to validate the value as a string.
 * - `@MinLength` and `@MaxLength` to enforce length constraints.
 * - `@Matches` to validate against the allowed character pattern.
 */
export function QuestionOptionValueProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Value',
      description:
        'The text of the answer. Must be between 1 and 75 characters long.',
      example: 'Paris',
      required: true,
      minLength: QUIZ_MULTI_CHOICE_OPTION_VALUE_MIN_LENGTH,
      maxLength: QUIZ_MULTI_CHOICE_OPTION_VALUE_MAX_LENGTH,
      type: String,
    }),
    IsString(),
    MinLength(1),
    MaxLength(75),
    Matches(QUIZ_MULTI_CHOICE_OPTION_VALUE_REGEX),
  )
}
