import {
  MultiChoiceQuestionCorrectAnswerDto,
  QuestionType,
  QUIZ_MULTI_CHOICE_OPTIONS_MAX,
} from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Max, Min } from 'class-validator'

import { ApiQuestionTypeProperty } from '../../../../quiz-api/controllers/decorators/api'

/**
 * Request model for submitting a correct answer to a MultiChoice question.
 *
 * Includes the `type` identifier and the correct `index` in the options array.
 */
export class MultiChoiceQuestionCorrectAnswerRequest implements MultiChoiceQuestionCorrectAnswerDto {
  /**
   * The type of the question, set to `MultiChoice`.
   */
  @ApiQuestionTypeProperty({
    description: `The type of the question, which is set to ${QuestionType.MultiChoice} for this request.`,
    explicitType: QuestionType.MultiChoice,
  })
  type: QuestionType.MultiChoice

  @ApiProperty({
    title: 'Index',
    description: 'The correct index for the multi-choice answer.',
    required: true,
    minimum: 0,
    maximum: QUIZ_MULTI_CHOICE_OPTIONS_MAX - 1,
    type: Number,
    example: 0,
  })
  @IsInt()
  @Min(0)
  @Max(QUIZ_MULTI_CHOICE_OPTIONS_MAX - 1)
  index: number
}
