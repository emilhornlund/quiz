import {
  QuestionType,
  SubmitPinQuestionAnswerRequestDto,
} from '@klurigo/common'

import {
  ApiQuestionPinPositionXProperty,
  ApiQuestionPinPositionYProperty,
} from '../../../../quiz/controllers/decorators/api'
import { ApiGameQuestionTypeProperty } from '../../decorators/api'

/**
 * Request model for a player’s submitted answer to a Pin question.
 *
 * Accepts normalized X/Y coordinates (0..1) of the placed pin.
 */
export class SubmitPinQuestionAnswerRequest implements SubmitPinQuestionAnswerRequestDto {
  /**
   * The type of the question, set to `Pin`.
   */
  @ApiGameQuestionTypeProperty(QuestionType.Pin)
  type: QuestionType.Pin

  /**
   * Submitted X coordinate normalized to image width (0..1).
   */
  @ApiQuestionPinPositionXProperty()
  positionX: number

  /**
   * Submitted Y coordinate normalized to image height (0..1).
   */
  @ApiQuestionPinPositionYProperty()
  positionY: number
}
