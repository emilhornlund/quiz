import { GameMode } from './game-mode.enum'
import { LanguageCode } from './language-code.enum'
import {
  QuestionMultiChoiceDto,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionTypeAnswerDto,
  QuestionZeroToOneHundredRangeDto,
} from './question.dto'

/**
 * Quiz visibility
 */
export enum QuizVisibility {
  Public = 'PUBLIC',
  Private = 'PRIVATE',
}

/**
 * Quiz Category
 */
export enum QuizCategory {
  GeneralKnowledge = 'GENERAL_KNOWLEDGE',
  Science = 'SCIENCE',
  History = 'HISTORY',
  Geography = 'GEOGRAPHY',
  Entertainment = 'ENTERTAINMENT',
  Sports = 'SPORTS',
  Literature = 'LITERATURE',
  Technology = 'TECHNOLOGY',
  Art = 'ART',
  Music = 'MUSIC',
  Film = 'FILM',
  FoodAndDrink = 'FOOD_AND_DRINK',
  Politics = 'POLITICS',
  Mythology = 'MYTHOLOGY',
  Nature = 'NATURE',
  Business = 'BUSINESS',
  Health = 'HEALTH',
  Religion = 'RELIGION',
  Space = 'SPACE',
  Mathematics = 'MATHEMATICS',
  Other = 'OTHER',
}

/**
 * Data transfer object for quiz creation and updating requests.
 */
export type QuizRequestDto = {
  /**
   * The title of the quiz.
   */
  title: string

  /**
   * A description of the quiz.
   */
  description?: string

  /**
   * Whether the quiz's visibility is public or private.
   */
  visibility: QuizVisibility

  /**
   * description here.
   */
  category: QuizCategory

  /**
   * The URL of the cover image for the quiz.
   */
  imageCoverURL?: string

  /**
   * The language code of the quiz.
   */
  languageCode: LanguageCode
} & (
  | {
      mode: GameMode.Classic
      questions: (
        | QuestionMultiChoiceDto
        | QuestionRangeDto
        | QuestionTrueFalseDto
        | QuestionTypeAnswerDto
      )[]
    }
  | {
      mode: GameMode.ZeroToOneHundred
      questions: QuestionZeroToOneHundredRangeDto[]
    }
)

/**
 * Data transfer object for a classic mode quiz creation and updating requests.
 */
export type QuizClassicModeRequestDto = Extract<
  QuizRequestDto,
  { mode: GameMode.Classic }
>

/**
 * Data transfer object for a zero to one hundred mode quiz creation and updating requests.
 */
export type QuizZeroToOneHundredModeRequestDto = Extract<
  QuizRequestDto,
  { mode: GameMode.ZeroToOneHundred }
>

/**
 * Represents the response object for a quiz author.
 */
export interface QuizAuthorResponseDto {
  /**
   * The unique identifier of the author.
   */
  id: string

  /**
   * The name of the author.
   */
  name: string
}

/**
 * Data transfer object for quiz responses.
 */
export interface QuizResponseDto {
  /**
   * The unique identifier of the quiz.
   */
  id: string

  /**
   * The title of the quiz.
   */
  title: string

  /**
   * A description of the quiz.
   */
  description?: string

  /**
   * The game mode of the quiz.
   */
  mode: GameMode

  /**
   * Whether the quiz's visibility is public or private.
   */
  visibility: QuizVisibility

  /**
   * description here.
   */
  category: QuizCategory

  /**
   * The URL of the cover image for the quiz.
   */
  imageCoverURL?: string

  /**
   * The language code of the quiz.
   */
  languageCode: LanguageCode

  /**
   * The total number of questions in the quiz.
   */
  numberOfQuestions: number

  /**
   * The author of the quiz.
   */
  author: QuizAuthorResponseDto

  /**
   * The date and time when the quiz was created.
   */
  created: Date

  /**
   * The date and time when the quiz was last updated.
   */
  updated: Date
}

/**
 * Represents a paginated response for quizzes.
 */
export interface PaginatedQuizResponseDto {
  /**
   * The list of quiz results for the current page.
   */
  results: QuizResponseDto[]

  /**
   * The total number of quizzes available.
   */
  total: number

  /**
   * The maximum number of quizzes returned per page.
   */
  limit: number

  /**
   * The offset from the start of the total quizzes.
   */
  offset: number
}
