import { QuestionTrueFalseDto, QuestionType } from '@quiz/common'

import {
  ApiQuestionDurationProperty,
  ApiQuestionMediaProperty,
  ApiQuestionPointsProperty,
  ApiQuestionProperty,
  ApiQuestionTrueFalseCorrectProperty,
  ApiQuestionTypeProperty,
} from '../decorators/api'

import { QuestionMedia } from './question-media'

/**
 * Represents a data transfer object for a true-or-false question.
 */
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
  @ApiQuestionMediaProperty({ type: () => QuestionMedia })
  media?: QuestionMedia

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
}
