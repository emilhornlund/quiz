import { PinQuestionCorrectAnswerDto, QuestionType } from '@quiz/common'

import {
  ApiQuestionPinPositionXProperty,
  ApiQuestionPinPositionYProperty,
  ApiQuestionTypeProperty,
} from '../../../../quiz/controllers/decorators/api'

/**
 * Request model for submitting the correct answer of a Pin question.
 *
 * Contains the normalized X/Y coordinates (0..1) of the correct location.
 */
export class PinQuestionCorrectAnswerRequest
  implements PinQuestionCorrectAnswerDto
{
  /**
   * The type of the question, set to `Pin`.
   */
  @ApiQuestionTypeProperty({
    description: `The type of the question, which is set to ${QuestionType.Pin} for this request.`,
    explicitType: QuestionType.Pin,
  })
  type: QuestionType.Pin

  /**
   * Correct X coordinate normalized to image width (0..1).
   */
  @ApiQuestionPinPositionXProperty()
  positionX: number

  /**
   * Correct Y coordinate normalized to image height (0..1).
   */
  @ApiQuestionPinPositionYProperty()
  positionY: number
}
