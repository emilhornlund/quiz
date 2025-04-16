import { ApiProperty } from '@nestjs/swagger'
import { GameResultClassicModePlayerMetricDto } from '@quiz/common'
import { IsNumber } from 'class-validator'

import {
  ApiGameParticipantProperty,
  ApiGameResultPlayerMetricAverageResponseTimeProperty,
  ApiGameResultPlayerMetricLongestCorrectStreakProperty,
  ApiGameResultPlayerMetricRankProperty,
  ApiGameResultPlayerMetricScoreProperty,
  ApiGameResultPlayerMetricUnansweredProperty,
} from '../../decorators/api'

import { GameResultParticipantResponse } from './game-result-participant.response'

/**
 * Represents a player's final performance metrics in the game for a classic mode game.
 */
export class GameResultClassicModePlayerMetricResponse
  implements GameResultClassicModePlayerMetricDto
{
  /**
   * The player who participated in the game.
   */
  @ApiGameParticipantProperty({
    description: 'The player who participated in the game.',
  })
  player: GameResultParticipantResponse

  /**
   * The player's final rank in the game (1 = first place, etc.).
   */
  @ApiGameResultPlayerMetricRankProperty()
  rank: number

  /**
   * The total number of questions the player answered correctly.
   */
  @ApiProperty({
    description: 'The total number of questions the player answered correctly.',
    required: true,
    type: Number,
  })
  @IsNumber()
  correct: number

  /**
   * The total number of questions the player answered incorrectly.
   */
  @ApiProperty({
    description:
      'The total number of questions the player answered incorrectly.',
    required: true,
    type: Number,
  })
  @IsNumber()
  incorrect: number

  /**
   * The total number of questions the player left unanswered.
   */
  @ApiGameResultPlayerMetricUnansweredProperty()
  unanswered: number

  /**
   * The average time (in milliseconds) the player took to answer questions.
   */
  @ApiGameResultPlayerMetricAverageResponseTimeProperty()
  averageResponseTime: number

  /**
   * The longest streak of consecutive correct answers by the player.
   */
  @ApiGameResultPlayerMetricLongestCorrectStreakProperty()
  longestCorrectStreak: number

  /**
   * The player's total score at the end of the game.
   */
  @ApiGameResultPlayerMetricScoreProperty()
  score: number
}
