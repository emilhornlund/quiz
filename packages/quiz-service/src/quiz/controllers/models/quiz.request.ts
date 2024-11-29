import { LanguageCode, QuizRequestDto, QuizVisibility } from '@quiz/common'

import {
  ApiQuizDescriptionProperty,
  ApiQuizImageCoverProperty,
  ApiQuizLanguageCodeProperty,
  ApiQuizTitleProperty,
  ApiQuizVisibilityProperty,
} from '../decorators/api'

/**
 * Represents the request object for creating and updating a quiz.
 */
export class QuizRequest implements QuizRequestDto {
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
}
