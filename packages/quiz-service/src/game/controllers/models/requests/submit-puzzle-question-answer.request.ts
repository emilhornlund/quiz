import {
  QuestionType,
  SubmitPuzzleQuestionAnswerRequestDto,
} from '@quiz/common'

import { ApiQuestionPuzzleValuesProperty } from '../../../../modules/quiz/controllers/decorators/api'
import { ApiGameQuestionTypeProperty } from '../../decorators/api'

/**
 * Request model for a player’s submitted answer to a Puzzle question.
 *
 * Accepts the player’s final ordered list of values.
 */
export class SubmitPuzzleQuestionAnswerRequest implements SubmitPuzzleQuestionAnswerRequestDto {
  /**
   * The type of the question, set to `Puzzle`.
   */
  @ApiGameQuestionTypeProperty(QuestionType.Puzzle)
  readonly type: QuestionType.Puzzle

  /**
   * The player’s ordered list representing their final arrangement.
   */
  @ApiQuestionPuzzleValuesProperty()
  readonly values: string[]
}
