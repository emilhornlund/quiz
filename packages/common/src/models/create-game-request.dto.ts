import { GameMode } from './game-mode.enum'
import { QuestionType } from './question-type.enum'

export interface CreateClassicModeQuestionMultiAnswerRequestDto {
  value: string
  correct: boolean
}

export interface CreateClassicModeQuestionMultiRequestDto {
  type: QuestionType.Multi
  question: string
  imageURL?: string
  answers: CreateClassicModeQuestionMultiAnswerRequestDto[]
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
  type: QuestionType.Slider
  question: string
  imageURL?: string
  min: number
  max: number
  correct: number
  points: number
  duration: number
}

export interface CreateZeroToOneHundredModeQuestionSliderRequestDto {
  type: QuestionType.Slider
  question: string
  imageURL?: string
  correct: number
  points: number
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
        | CreateClassicModeQuestionMultiRequestDto
        | CreateClassicModeQuestionTrueFalseRequestDto
        | CreateClassicModeQuestionSliderRequestDto
        | CreateClassicModeQuestionTypeAnswerRequestDto
      )[]
    }
  | {
      mode: GameMode.ZeroToOneHundred
      questions: CreateZeroToOneHundredModeQuestionSliderRequestDto[]
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
