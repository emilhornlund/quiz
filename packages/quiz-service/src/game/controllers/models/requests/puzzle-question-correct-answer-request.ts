import { PuzzleQuestionCorrectAnswerDto, QuestionType } from '@quiz/common'

import {
  ApiQuestionPuzzleValuesProperty,
  ApiQuestionTypeProperty,
} from '../../../../quiz/controllers/decorators/api'

/**
 * Request model for submitting the correct answer of a Puzzle question.
 *
 * Contains the target ordering of the puzzle’s values.
 */
export class PuzzleQuestionCorrectAnswerRequest
  implements PuzzleQuestionCorrectAnswerDto
{
  /**
   * The type of the question, set to `Puzzle`.
   */
  @ApiQuestionTypeProperty({
    description: `The type of the question, which is set to ${QuestionType.Puzzle} for this request.`,
    explicitType: QuestionType.Puzzle,
  })
  readonly type: QuestionType.Puzzle

  /**
   * The correct sequence of values (final target ordering).
   */
  @ApiQuestionPuzzleValuesProperty()
  readonly values: string[]
}
