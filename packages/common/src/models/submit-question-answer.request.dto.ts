import { QuestionType } from './question-type.enum'

export interface SubmitMultiChoiceQuestionAnswerRequestDto {
  type: QuestionType.MultiChoice
  optionIndex: number
}

export interface SubmitRangeQuestionAnswerRequestDto {
  type: QuestionType.Range
  value: number
}

export interface SubmitTrueFalseQuestionAnswerRequestDto {
  type: QuestionType.TrueFalse
  value: boolean
}

export interface SubmitTypeAnswerQuestionAnswerRequestDto {
  type: QuestionType.TypeAnswer
  value: string
}

export type SubmitQuestionAnswerRequestDto =
  | SubmitMultiChoiceQuestionAnswerRequestDto
  | SubmitRangeQuestionAnswerRequestDto
  | SubmitTrueFalseQuestionAnswerRequestDto
  | SubmitTypeAnswerQuestionAnswerRequestDto
