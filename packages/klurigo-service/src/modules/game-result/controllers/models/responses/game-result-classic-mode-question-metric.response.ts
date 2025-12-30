import {
  GameResultClassicModeQuestionMetricDto,
  QuestionType,
} from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'

import {
  ApiQuestionProperty,
  ApiQuestionTypeProperty,
} from '../../../../quiz/controllers/decorators/api'
import {
  ApiGameResultQuestionMetricAverageResponseTimeProperty,
  ApiGameResultQuestionMetricUnansweredProperty,
} from '../../decorators/api'

/**
 * Represents the aggregated performance metrics for a single question in a classic mode game.
 */
export class GameResultClassicModeQuestionMetricResponse implements GameResultClassicModeQuestionMetricDto {
  /**
   * The text of the question.
   */
  @ApiQuestionProperty()
  text: string

  /**
   * The type of the question (e.g., multiple choice, range, true/false).
   */
  @ApiQuestionTypeProperty()
  type: QuestionType

  /**
   * The number of players who answered the question correctly.
   */
  @ApiProperty({
    title: 'Correct',
    description: 'The number of players who answered the question correctly.',
    required: true,
    type: Number,
  })
  @IsNumber()
  correct: number

  /**
   * The number of players who answered the question incorrectly.
   */
  @ApiProperty({
    title: 'Incorrect',
    description: 'The number of players who answered the question incorrectly.',
    required: true,
    type: Number,
  })
  @IsNumber()
  incorrect: number

  /**
   * The number of players who left the question unanswered.
   */
  @ApiGameResultQuestionMetricUnansweredProperty()
  unanswered: number

  /**
   * The average time (in milliseconds) that players took to answer the question.
   */
  @ApiGameResultQuestionMetricAverageResponseTimeProperty()
  averageResponseTime: number
}
