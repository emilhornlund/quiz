import {
  QuestionType,
  SubmitTypeAnswerQuestionAnswerRequestDto,
} from '@quiz/common'

import {
  ApiGameQuestionTypeAnswerValue,
  ApiGameQuestionTypeProperty,
} from '../../decorators/api'

/**
 * DTO for submitting an answer to a type answer question.
 */
export class SubmitTypeAnswerQuestionAnswerRequest
  implements SubmitTypeAnswerQuestionAnswerRequestDto
{
  @ApiGameQuestionTypeProperty(QuestionType.TypeAnswer)
  type: QuestionType.TypeAnswer

  @ApiGameQuestionTypeAnswerValue()
  value: string
}
