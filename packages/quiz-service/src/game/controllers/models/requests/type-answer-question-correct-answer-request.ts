import { ApiProperty } from '@nestjs/swagger'
import {
  QuestionType,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX_LENGTH,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN_LENGTH,
  TypeAnswerQuestionCorrectAnswerDto,
} from '@quiz/common'
import { IsString, MaxLength, MinLength } from 'class-validator'

import { ApiQuestionTypeProperty } from '../../../../modules/quiz/controllers/decorators/api'

/**
 * Request model for submitting a correct answer to a TypeAnswer question.
 *
 * Includes the `type` identifier and the string `value` that should be accepted as correct.
 */
export class TypeAnswerQuestionCorrectAnswerRequest implements TypeAnswerQuestionCorrectAnswerDto {
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
    minLength: QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN_LENGTH,
    maxLength: QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX_LENGTH,
    type: String,
  })
  @IsString()
  @MinLength(QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN_LENGTH)
  @MaxLength(QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX_LENGTH)
  value: string
}
