import {
  QuestionType,
  SubmitMultiChoiceQuestionAnswerRequestDto,
  SubmitRangeQuestionAnswerRequestDto,
  SubmitTrueFalseQuestionAnswerRequestDto,
  SubmitTypeAnswerQuestionAnswerRequestDto,
} from '@quiz/common'

import {
  GameQuestionMultiChoiceAnswerOptionIndex,
  GameQuestionRangeAnswerValue,
  GameQuestionTrueFalseAnswerValue,
  GameQuestionTypeAnswerValue,
  GameQuestionTypeProperty,
} from '../../decorators'

/**
 * DTO for submitting an answer to a multi-choice question.
 */
export class SubmitMultiChoiceQuestionAnswerRequest
  implements SubmitMultiChoiceQuestionAnswerRequestDto
{
  @GameQuestionTypeProperty(QuestionType.MultiChoice)
  type: QuestionType.MultiChoice

  @GameQuestionMultiChoiceAnswerOptionIndex()
  optionIndex: number
}

/**
 * DTO for submitting an answer to a range question.
 */
export class SubmitRangeQuestionAnswerRequest
  implements SubmitRangeQuestionAnswerRequestDto
{
  @GameQuestionTypeProperty(QuestionType.Range)
  type: QuestionType.Range

  @GameQuestionRangeAnswerValue()
  value: number
}

/**
 * DTO for submitting an answer to a true/false question.
 */
export class SubmitTrueFalseQuestionAnswerRequest
  implements SubmitTrueFalseQuestionAnswerRequestDto
{
  @GameQuestionTypeProperty(QuestionType.TrueFalse)
  type: QuestionType.TrueFalse

  @GameQuestionTrueFalseAnswerValue()
  value: boolean
}

/**
 * DTO for submitting an answer to a type answer question.
 */
export class SubmitTypeAnswerQuestionAnswerRequest
  implements SubmitTypeAnswerQuestionAnswerRequestDto
{
  @GameQuestionTypeProperty(QuestionType.TypeAnswer)
  type: QuestionType.TypeAnswer

  @GameQuestionTypeAnswerValue()
  value: string
}
