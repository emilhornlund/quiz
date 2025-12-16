import {
  QuestionType,
  SubmitMultiChoiceQuestionAnswerRequestDto,
} from '@quiz/common'

import {
  ApiGameQuestionMultiChoiceAnswerOptionIndex,
  ApiGameQuestionTypeProperty,
} from '../../decorators/api'

/**
 * DTO for submitting an answer to a multi-choice question.
 */
export class SubmitMultiChoiceQuestionAnswerRequest implements SubmitMultiChoiceQuestionAnswerRequestDto {
  @ApiGameQuestionTypeProperty(QuestionType.MultiChoice)
  type: QuestionType.MultiChoice

  @ApiGameQuestionMultiChoiceAnswerOptionIndex()
  optionIndex: number
}
