import { ApiProperty } from '@nestjs/swagger'
import {
  QuestionType,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN,
  TypeAnswerQuestionCorrectAnswerDto,
} from '@quiz/common'
import { IsString, MaxLength, MinLength } from 'class-validator'

import { ApiQuestionTypeProperty } from '../../../../quiz/controllers/decorators/api'

/**
 * Request model for submitting a correct answer to a TypeAnswer question.
 *
 * Includes the `type` identifier and the string `value` that should be accepted as correct.
 */
export class TypeAnswerQuestionCorrectAnswerRequest
  implements TypeAnswerQuestionCorrectAnswerDto
{
  /**
   * The type of the question, set to `TypeAnswer`.
   */
  @ApiQuestionTypeProperty({
    description: `The type of the question, which is set to ${QuestionType.TypeAnswer} for this request.`,
    explicitType: QuestionType.TypeAnswer,
  })
  type: QuestionType.TypeAnswer

  @ApiProperty({
    title: 'Value',
    description: 'The correct value for the type-answer.',
    example: 'Stockholm',
    required: true,
    minLength: QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN,
    maxLength: QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX,
    type: String,
  })
  @IsString()
  @MinLength(QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN)
  @MaxLength(QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX)
  value: string
}
