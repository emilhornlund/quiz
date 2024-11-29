import { LanguageCode } from './language-code.enum'

/**
 * Quiz visibility
 */
export enum QuizVisibility {
  Public = 'PUBLIC',
  Private = 'PRIVATE',
}

/**
 * Data transfer object for quiz creation and updating requests.
 */
export interface QuizRequestDto {
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
   * The URL of the cover image for the quiz.
   */
  imageCoverURL?: string

  /**
   * The language code of the quiz.
   */
  languageCode: LanguageCode
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
   * Whether the quiz's visibility is public or private.
   */
  visibility: QuizVisibility

  /**
   * The URL of the cover image for the quiz.
   */
  imageCoverURL?: string

  /**
   * The language code of the quiz.
   */
  languageCode: LanguageCode

  /**
   * The date and time when the quiz was created.
   */
  created: Date

  /**
   * The date and time when the quiz was last updated.
   */
  updated: Date
}
