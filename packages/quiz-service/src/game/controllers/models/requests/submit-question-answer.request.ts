import {
  QuestionType,
  SubmitMultiChoiceQuestionAnswerRequestDto,
  SubmitRangeQuestionAnswerRequestDto,
  SubmitTrueFalseQuestionAnswerRequestDto,
  SubmitTypeAnswerQuestionAnswerRequestDto,
} from '@quiz/common'

import {
  ApiGameQuestionMultiChoiceAnswerOptionIndex,
  ApiGameQuestionRangeAnswerValue,
  ApiGameQuestionTrueFalseAnswerValue,
  ApiGameQuestionTypeAnswerValue,
  ApiGameQuestionTypeProperty,
} from '../../decorators/api'

/**
 * DTO for submitting an answer to a multi-choice question.
 */
export class SubmitMultiChoiceQuestionAnswerRequest
  implements SubmitMultiChoiceQuestionAnswerRequestDto
{
  @ApiGameQuestionTypeProperty(QuestionType.MultiChoice)
  type: QuestionType.MultiChoice

  @ApiGameQuestionMultiChoiceAnswerOptionIndex()
  optionIndex: number
}

/**
 * DTO for submitting an answer to a range question.
 */
export class SubmitRangeQuestionAnswerRequest
  implements SubmitRangeQuestionAnswerRequestDto
{
  @ApiGameQuestionTypeProperty(QuestionType.Range)
  type: QuestionType.Range

  @ApiGameQuestionRangeAnswerValue()
  value: number
}

/**
 * DTO for submitting an answer to a true/false question.
 */
export class SubmitTrueFalseQuestionAnswerRequest
  implements SubmitTrueFalseQuestionAnswerRequestDto
{
  @ApiGameQuestionTypeProperty(QuestionType.TrueFalse)
  type: QuestionType.TrueFalse

  @ApiGameQuestionTrueFalseAnswerValue()
  value: boolean
}

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
