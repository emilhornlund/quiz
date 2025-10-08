import { QuestionMultiChoiceDto, QuestionType } from '@quiz/common'

import {
  ApiQuestionDurationProperty,
  ApiQuestionInfoProperty,
  ApiQuestionMediaProperty,
  ApiQuestionOptionsProperty,
  ApiQuestionPointsProperty,
  ApiQuestionProperty,
  ApiQuestionTypeProperty,
} from '../decorators/api'

import { QuestionMedia } from './question-media'
import { QuestionMultiChoiceOption } from './question-multi-choice-option'

/**
 * Represents a data transfer object for a multiple-choice question.
 */
export class QuestionMultiChoice implements QuestionMultiChoiceDto {
  /**
   * The type of the question, set to `MultiChoice`.
   */
  @ApiQuestionTypeProperty({
    description: `The type of the question, which is set to ${QuestionType.MultiChoice} for this request.`,
    explicitType: QuestionType.MultiChoice,
  })
  type: QuestionType.MultiChoice

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
   * The list of options for the question.
   */
  @ApiQuestionOptionsProperty({ type: () => QuestionMultiChoiceOption })
  options: QuestionMultiChoiceOption[]

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
