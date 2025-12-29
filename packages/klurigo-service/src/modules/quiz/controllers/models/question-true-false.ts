import { QuestionTrueFalseDto, QuestionType } from '@klurigo/common'
import { ApiExtraModels } from '@nestjs/swagger'

import {
  ApiQuestionDurationProperty,
  ApiQuestionInfoProperty,
  ApiQuestionMediaProperty,
  ApiQuestionPointsProperty,
  ApiQuestionProperty,
  ApiQuestionTrueFalseCorrectProperty,
  ApiQuestionTypeProperty,
} from '../decorators/api'

import {
  QuestionAudioMedia,
  QuestionImageMedia,
  QuestionVideoMedia,
} from './question-media'

/**
 * Represents a data transfer object for a true-or-false question.
 */
@ApiExtraModels(QuestionImageMedia, QuestionAudioMedia, QuestionVideoMedia)
export class QuestionTrueFalse implements QuestionTrueFalseDto {
  /**
   * The type of the question, set to `TrueFalse`.
   */
  @ApiQuestionTypeProperty({
    description: `The type of the question, which is set to ${QuestionType.TrueFalse} for this request.`,
    explicitType: QuestionType.TrueFalse,
  })
  type: QuestionType.TrueFalse

  /**
   * The text of the question.
   */
  @ApiQuestionProperty()
  question: string

  /**
   * Optional media associated with the question.
   */
  @ApiQuestionMediaProperty({
    image: () => QuestionImageMedia,
    audio: () => QuestionAudioMedia,
    video: () => QuestionVideoMedia,
  })
  media?: QuestionImageMedia | QuestionAudioMedia | QuestionVideoMedia

  /**
   * The correct answer for the question (true or false).
   */
  @ApiQuestionTrueFalseCorrectProperty()
  correct: boolean

  /**
   * The points awarded for answering the question correctly.
   */
  @ApiQuestionPointsProperty()
  points: number

  /**
   * The duration in seconds allowed to answer the question.
   */
  @ApiQuestionDurationProperty()
  duration: number

  /**
   * Optional info text shown with the question result/review
   * (explanation, fun fact, or source).
   */
  @ApiQuestionInfoProperty()
  info?: string
}
