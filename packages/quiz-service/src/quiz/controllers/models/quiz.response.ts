import {
  GameMode,
  LanguageCode,
  QuizResponseDto,
  QuizVisibility,
} from '@quiz/common'

import {
  ApiModeProperty,
  ApiQuizCreatedProperty,
  ApiQuizDescriptionProperty,
  ApiQuizIdProperty,
  ApiQuizImageCoverProperty,
  ApiQuizLanguageCodeProperty,
  ApiQuizTitleProperty,
  ApiQuizUpdatedProperty,
  ApiQuizVisibilityProperty,
} from '../decorators/api'

/**
 * Represents the response object for a quiz.
 */
export class QuizResponse implements QuizResponseDto {
  /**
   * The unique identifier of the quiz.
   */
  @ApiQuizIdProperty()
  id: string

  /**
   * The title of the quiz.
   */
  @ApiQuizTitleProperty()
  title: string

  /**
   * A description of the quiz.
   */
  @ApiQuizDescriptionProperty()
  description?: string

  /**
   * description
   */
  @ApiModeProperty()
  mode: GameMode

  /**
   * Whether the quiz is public or private.
   */
  @ApiQuizVisibilityProperty()
  visibility: QuizVisibility

  /**
   * The URL of the cover image for the quiz.
   */
  @ApiQuizImageCoverProperty()
  imageCoverURL?: string

  /**
   * The language code of the quiz.
   */
  @ApiQuizLanguageCodeProperty()
  languageCode: LanguageCode

  /**
   * The date and time when the quiz was created.
   */
  @ApiQuizCreatedProperty()
  created: Date

  /**
   * The date and time when the quiz was last updated.
   */
  @ApiQuizUpdatedProperty()
  updated: Date
}
