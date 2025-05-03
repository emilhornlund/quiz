import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import {
  QUIZ_TYPE_ANSWER_OPTIONS_MAX,
  QUIZ_TYPE_ANSWER_OPTIONS_MIN,
} from '@quiz/common'
import { Type } from 'class-transformer'
import { ArrayMaxSize, ArrayMinSize, IsArray } from 'class-validator'

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
    Type(() => String),
  )
}
