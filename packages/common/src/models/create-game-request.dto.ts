import { GameMode } from './game-mode.enum'
import { QuestionType } from './question-type.enum'

export type CreateGameRequestDto = {
  name: string
} & (
  | {
      mode: GameMode.Classic
      questions: (
        | {
            type: QuestionType.Multi
            question: string
            imageURL?: string
            answers: { value: string; correct: boolean }[]
            duration: number
          }
        | {
            type: QuestionType.TrueFalse
            question: string
            imageURL?: string
            correct: boolean
            duration: number
          }
        | {
            type: QuestionType.Slider
            question: string
            imageURL?: string
            min: number
            max: number
            correct: number
            duration: number
          }
        | {
            type: QuestionType.TypeAnswer
            question: string
            imageURL?: string
            correct: string
            duration: number
          }
      )[]
    }
  | {
      mode: GameMode.ZeroToOneHundred
      questions: {
        type: QuestionType.Slider
        question: string
        imageURL?: string
        correct: number
        duration: number
      }[]
    }
)
