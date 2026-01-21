import {
  QUIZ_TYPE_ANSWER_OPTIONS_MAX,
  QUIZ_TYPE_ANSWER_OPTIONS_MIN,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX_LENGTH,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN_LENGTH,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX,
} from '@klurigo/common'
import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

/**
 * Decorator for documenting and validating the `options` property of a type answer question.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsArray` to validate the value as an array.
 * - `@ArrayMinSize` and `@ArrayMaxSize` to enforce array size limits.
 * - `@Type` to transform each entry to a string.
 */
export function ApiQuestionTypeAnswerOptionsProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Options',
      description: 'The list of possible typed answers for a question.',
      required: true,
      type: [String],
    }),
    IsArray(),
    ArrayMinSize(QUIZ_TYPE_ANSWER_OPTIONS_MIN),
    ArrayMaxSize(QUIZ_TYPE_ANSWER_OPTIONS_MAX),
    IsString({ each: true }),
    MinLength(QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN_LENGTH, { each: true }),
    MaxLength(QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX_LENGTH, { each: true }),
    Matches(QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX, {
      each: true,
      message:
        'The typed answer can only contain letters, numbers, underscores and spaces.',
    }),
    Type(() => String),
  )
}
