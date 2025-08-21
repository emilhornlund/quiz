import {
  QuestionPinDto,
  QuestionPinTolerance,
  QuestionType,
} from '@quiz/common'

import {
  ApiQuestionDurationProperty,
  ApiQuestionPinImageUrlProperty,
  ApiQuestionPinPositionXProperty,
  ApiQuestionPinPositionYProperty,
  ApiQuestionPinToleranceProperty,
  ApiQuestionPointsProperty,
  ApiQuestionProperty,
  ApiQuestionTypeProperty,
} from '../decorators/api'

/**
 * Represents a data transfer object for a pin question.
 * Players place a single marker on an image; scoring is based on distance to the correct point.
 */
export class QuestionPin implements QuestionPinDto {
  /**
   * The type of the question, set to `Pin`.
   */
  @ApiQuestionTypeProperty({
    description: `The type of the question, which is set to ${QuestionType.Pin} for this request.`,
    explicitType: QuestionType.Pin,
  })
  type: QuestionType.Pin

  /**
   * The text of the question.
   */
  @ApiQuestionProperty()
  question: string

  /**
   * Public URL of the background image on which the player places the pin.
   */
  @ApiQuestionPinImageUrlProperty()
  imageURL: string

  /**
   * Correct X coordinate normalized to image width.
   * Range: 0 (left) … 1 (right).
   */
  @ApiQuestionPinPositionXProperty()
  positionX: number

  /**
   * Correct Y coordinate normalized to image height.
   * Range: 0 (top) … 1 (bottom).
   */
  @ApiQuestionPinPositionYProperty()
  positionY: number

  /**
   * Allowed distance preset around the correct point that counts as correct.
   * Higher tolerance accepts pins farther from the exact position.
   */
  @ApiQuestionPinToleranceProperty()
  tolerance: QuestionPinTolerance

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
