import {
  QUIZ_MULTI_CHOICE_OPTIONS_MAX,
  QUIZ_MULTI_CHOICE_OPTIONS_MIN,
} from '@klurigo/common'
import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { TypeHelpOptions } from 'class-transformer/types/interfaces'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator'

/**
 * Decorator for documenting and validating the `options` property of a multiple choice question.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsArray` to validate the value as an array.
 * - `@ArrayMinSize` and `@ArrayMaxSize` to enforce array size limits.
 * - `@ValidateNested` to validate each item in the array.
 * - `@Type` to transform each entry into a `QuestionMultiChoiceOption` instance.
 */
export function ApiQuestionOptionsProperty(options: {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  type?: (type?: TypeHelpOptions) => Function
}): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Options',
      description: 'The list of possible answers for a question.',
      required: true,
      type: () => [options.type],
    }),
    IsArray(),
    ArrayMinSize(QUIZ_MULTI_CHOICE_OPTIONS_MIN),
    ArrayMaxSize(QUIZ_MULTI_CHOICE_OPTIONS_MAX),
    ValidateNested({ each: true }),
    Type(options.type),
  )
}
