import { ApiProperty } from '@nestjs/swagger'
import {
  GameResultZeroToOneHundredModeQuestionMetricDto,
  QuestionType,
} from '@quiz/common'
import { IsNumber } from 'class-validator'

import {
  ApiQuestionProperty,
  ApiQuestionTypeProperty,
} from '../../../../modules/quiz/controllers/decorators/api'
import {
  ApiGameResultQuestionMetricAverageResponseTimeProperty,
  ApiGameResultQuestionMetricUnansweredProperty,
} from '../../decorators/api'

/**
 * Represents the aggregated performance metrics for a single question in a zero to one hundred mode game.
 */
export class GameResultZeroToOneHundredModeQuestionMetricResponse implements GameResultZeroToOneHundredModeQuestionMetricDto {
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
   * The average precision score across all player answers for this question.
   */
  @ApiProperty({
    title: 'Average Precision',
    description:
      'The average precision score across all player answers for this question.',
    required: true,
    type: Number,
  })
  @IsNumber()
  averagePrecision: number

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
