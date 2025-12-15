import { QuestionType, SubmitRangeQuestionAnswerRequestDto } from '@quiz/common'

import {
  ApiGameQuestionRangeAnswerValue,
  ApiGameQuestionTypeProperty,
} from '../../decorators/api'

/**
 * DTO for submitting an answer to a range question.
 */
export class SubmitRangeQuestionAnswerRequest implements SubmitRangeQuestionAnswerRequestDto {
  @ApiGameQuestionTypeProperty(QuestionType.Range)
  type: QuestionType.Range

  @ApiGameQuestionRangeAnswerValue()
  value: number
}
