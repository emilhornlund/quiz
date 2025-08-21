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

export interface SubmitPinQuestionAnswerRequestDto {
  readonly type: QuestionType.Pin
  readonly positionX: number
  readonly positionY: number
}

export interface SubmitPuzzleQuestionAnswerRequestDto {
  readonly type: QuestionType.Puzzle
  readonly values: string[]
}

export type SubmitQuestionAnswerRequestDto =
  | SubmitMultiChoiceQuestionAnswerRequestDto
  | SubmitRangeQuestionAnswerRequestDto
  | SubmitTrueFalseQuestionAnswerRequestDto
  | SubmitTypeAnswerQuestionAnswerRequestDto
  | SubmitPinQuestionAnswerRequestDto
  | SubmitPuzzleQuestionAnswerRequestDto
