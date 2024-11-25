import { GameMode } from './game-mode.enum'
import { QuestionRangeAnswerMargin } from './question-range-answer-margin.enum'
import { QuestionType } from './question-type.enum'

export interface CreateClassicModeQuestionMultiChoiceAnswerRequestDto {
  value: string
  correct: boolean
}

export interface CreateClassicModeQuestionMultiChoiceRequestDto {
  type: QuestionType.MultiChoice
  question: string
  imageURL?: string
  answers: CreateClassicModeQuestionMultiChoiceAnswerRequestDto[]
  points: number
  duration: number
}

export interface CreateClassicModeQuestionTrueFalseRequestDto {
  type: QuestionType.TrueFalse
  question: string
  imageURL?: string
  correct: boolean
  points: number
  duration: number
}

export interface CreateClassicModeQuestionSliderRequestDto {
  type: QuestionType.Range
  question: string
  imageURL?: string
  min: number
  max: number
  margin: QuestionRangeAnswerMargin
  correct: number
  points: number
  duration: number
}

export interface CreateZeroToOneHundredModeQuestionRangeRequestDto {
  type: QuestionType.Range
  question: string
  imageURL?: string
  correct: number
  duration: number
}

export interface CreateClassicModeQuestionTypeAnswerRequestDto {
  type: QuestionType.TypeAnswer
  question: string
  imageURL?: string
  correct: string
  points: number
  duration: number
}

export type CreateGameRequestDto = {
  name: string
} & (
  | {
      mode: GameMode.Classic
      questions: (
        | CreateClassicModeQuestionMultiChoiceRequestDto
        | CreateClassicModeQuestionTrueFalseRequestDto
        | CreateClassicModeQuestionSliderRequestDto
        | CreateClassicModeQuestionTypeAnswerRequestDto
      )[]
    }
  | {
      mode: GameMode.ZeroToOneHundred
      questions: CreateZeroToOneHundredModeQuestionRangeRequestDto[]
    }
)

export type CreateClassicModeGameRequestDto = Extract<
  CreateGameRequestDto,
  { mode: GameMode.Classic }
>

export type CreateZeroToOneHundredModeGameRequestDto = Extract<
  CreateGameRequestDto,
  { mode: GameMode.ZeroToOneHundred }
>
