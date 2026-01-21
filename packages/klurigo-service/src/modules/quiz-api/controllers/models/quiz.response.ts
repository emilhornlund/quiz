import {
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizResponseDto,
  QuizVisibility,
} from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'

import {
  ApiGameModeProperty,
  ApiQuizCategoryProperty,
  ApiQuizCreatedProperty,
  ApiQuizDescriptionProperty,
  ApiQuizIdProperty,
  ApiQuizImageCoverProperty,
  ApiQuizLanguageCodeProperty,
  ApiQuizTitleProperty,
  ApiQuizUpdatedProperty,
  ApiQuizVisibilityProperty,
} from '../decorators/api'

import { QuizAuthorResponse } from './quiz-author.response'
import { QuizRatingSummaryResponse } from './quiz-rating-summary.response'

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
   * The game mode of this quiz.
   */
  @ApiGameModeProperty()
  mode: GameMode

  /**
   * Whether the quiz is public or private.
   */
  @ApiQuizVisibilityProperty()
  visibility: QuizVisibility

  /**
   * Specifies the category of the quiz.
   */
  @ApiQuizCategoryProperty()
  category: QuizCategory

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
   * The total number of questions in the quiz.
   */
  @ApiProperty({
    description: 'The total number of questions in the quiz.',
    type: Number,
    required: true,
    example: 20,
  })
  numberOfQuestions: number

  /**
   * The author of the quiz.
   */
  @ApiProperty({
    description: 'Details about the author of the quiz.',
    type: QuizAuthorResponse,
  })
  author: QuizAuthorResponse

  /**
   * Aggregated rating information for the quiz.
   *
   * Includes the average star rating and the total number of comments.
   */
  @ApiProperty({
    title: 'Rating Summary',
    description:
      'Aggregated rating information for the quiz, including average stars and comment count.',
    required: true,
    type: QuizRatingSummaryResponse,
  })
  readonly ratingSummary: QuizRatingSummaryResponse

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
