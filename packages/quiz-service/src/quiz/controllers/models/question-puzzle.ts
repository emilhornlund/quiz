import { QuestionPuzzleDto, QuestionType } from '@quiz/common'

import {
  ApiQuestionDurationProperty,
  ApiQuestionMediaProperty,
  ApiQuestionPointsProperty,
  ApiQuestionProperty,
  ApiQuestionPuzzleValuesProperty,
  ApiQuestionTypeProperty,
} from '../decorators/api'

import { QuestionMedia } from './question-media'

/**
 * Represents a data transfer object for a puzzle question.
 * Players must sort the provided values into the correct order.
 */
export class QuestionPuzzle implements QuestionPuzzleDto {
  /**
   * The type of the question, set to `Puzzle`.
   */
  @ApiQuestionTypeProperty({
    description: `The type of the question, which is set to ${QuestionType.Puzzle} for this request.`,
    explicitType: QuestionType.Puzzle,
  })
  type: QuestionType.Puzzle

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
   * Values that the player must sort into the correct order.
   */
  @ApiQuestionPuzzleValuesProperty()
  readonly values: string[]

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
