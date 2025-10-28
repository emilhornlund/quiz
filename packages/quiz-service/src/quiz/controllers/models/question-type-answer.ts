import { ApiExtraModels } from '@nestjs/swagger'
import { QuestionType, QuestionTypeAnswerDto } from '@quiz/common'

import {
  ApiQuestionDurationProperty,
  ApiQuestionInfoProperty,
  ApiQuestionMediaProperty,
  ApiQuestionPointsProperty,
  ApiQuestionProperty,
  ApiQuestionTypeAnswerOptionsProperty,
  ApiQuestionTypeProperty,
} from '../decorators/api'

import {
  QuestionAudioMedia,
  QuestionImageMedia,
  QuestionVideoMedia,
} from './question-media'

/**
 * Represents a data transfer object for a type-answer question.
 */
@ApiExtraModels(QuestionImageMedia, QuestionAudioMedia, QuestionVideoMedia)
export class QuestionTypeAnswer implements QuestionTypeAnswerDto {
  /**
   * The type of the question, set to `TypeAnswer`.
   */
  @ApiQuestionTypeProperty({
    description: `The type of the question, which is set to ${QuestionType.TypeAnswer} for this request.`,
    explicitType: QuestionType.TypeAnswer,
  })
  type: QuestionType.TypeAnswer

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
   * The list of acceptable answers for the question.
   */
  @ApiQuestionTypeAnswerOptionsProperty()
  options: string[]

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
