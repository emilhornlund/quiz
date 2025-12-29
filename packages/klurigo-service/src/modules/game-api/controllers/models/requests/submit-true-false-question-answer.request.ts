import {
  QuestionType,
  SubmitTrueFalseQuestionAnswerRequestDto,
} from '@klurigo/common'

import {
  ApiGameQuestionTrueFalseAnswerValue,
  ApiGameQuestionTypeProperty,
} from '../../decorators/api'

/**
 * DTO for submitting an answer to a true/false question.
 */
export class SubmitTrueFalseQuestionAnswerRequest implements SubmitTrueFalseQuestionAnswerRequestDto {
  @ApiGameQuestionTypeProperty(QuestionType.TrueFalse)
  type: QuestionType.TrueFalse

  @ApiGameQuestionTrueFalseAnswerValue()
  value: boolean
}
