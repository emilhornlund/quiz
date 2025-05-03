import { QuestionType, QuestionTypeAnswerDto } from '@quiz/common'

import {
  ApiQuestionDurationProperty,
  ApiQuestionMediaProperty,
  ApiQuestionPointsProperty,
  ApiQuestionProperty,
  ApiQuestionTypeAnswerOptionsProperty,
  ApiQuestionTypeProperty,
} from '../decorators/api'

import { QuestionMedia } from './question-media'

/**
 * Represents a data transfer object for a type-answer question.
 */
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
  @ApiQuestionMediaProperty({ type: () => QuestionMedia })
  media?: QuestionMedia

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
}
