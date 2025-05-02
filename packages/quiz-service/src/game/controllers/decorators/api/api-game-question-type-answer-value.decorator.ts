import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import {
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX,
} from '@quiz/common'
import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

export function ApiGameQuestionTypeAnswerValue() {
  return applyDecorators(
    ApiProperty({
      description: 'The submitted answer to the type answer question.',
      example: 'Stockholm',
      required: true,
      minLength: QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN,
      maxLength: QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX,
      type: String,
    }),
    IsString(),
    MinLength(QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN),
    MaxLength(QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX),
    Matches(QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX, {
      message:
        'The typed answer can only contain letters, numbers, underscores and spaces.',
    }),
  )
}
