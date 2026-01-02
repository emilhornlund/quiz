import {
  GAME_MAX_PLAYERS,
  GAME_MIN_PLAYERS,
  GameMode,
  GameResultZeroToOneHundredModeDto,
  QUIZ_QUESTION_MAX,
  QUIZ_QUESTION_MIN,
} from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { Max, Min, ValidateNested } from 'class-validator'

import {
  ApiGameIdProperty,
  ApiGameNameProperty,
} from '../../../../game-api/controllers/decorators/api'
import { ApiGameModeProperty } from '../../../../quiz/controllers/decorators/api'
import {
  ApiGameResultCreatedProperty,
  ApiGameResultDurationProperty,
  ApiGameResultNumberOfPlayersProperty,
  ApiGameResultNumberOfQuestionsProperty,
  ApiGameResultQuizProperty,
} from '../../decorators/api'

import { GameResultParticipantResponse } from './game-result-participant.response'
import { GameResultQuizResponse } from './game-result-quiz.response'
import { GameResultZeroToOneHundredModePlayerMetricResponse } from './game-result-zero-to-one-hundred-mode-player-metric-response'
import { GameResultZeroToOneHundredModeQuestionMetricResponse } from './game-result-zero-to-one-hundred-mode-question-metric.response'

/**
 * API response structure representing the final results of a completed game using the zero to one hundred mode.
 */
export class GameResultZeroToOneHundredModeResponse implements GameResultZeroToOneHundredModeDto {
  /**
   * The unique identifier for the game.
   */
  @ApiGameIdProperty({
    description: 'The unique identifier for the game.',
  })
  id: string

  /**
   * The zero to one hundred game mode of the quiz.
   */
  @ApiGameModeProperty(GameMode.ZeroToOneHundred)
  mode: GameMode.ZeroToOneHundred

  /**
   * The name or title of the quiz.
   */
  @ApiGameNameProperty()
  name: string

  /**
   * The quiz associated with the completed game.
   *
   * Includes the quiz identifier and whether the caller can create a new live game
   * based on this quiz.
   */
  @ApiGameResultQuizProperty()
  quiz: GameResultQuizResponse

  /**
   * The participant who created and hosted the game.
   */
  @ApiProperty({
    title: 'Host',
    description: 'The participant who created and hosted the game.',
    required: true,
    type: GameResultParticipantResponse,
  })
  @Type(() => GameResultParticipantResponse)
  @ValidateNested({ each: true })
  host: GameResultParticipantResponse

  /**
   * Total number of players who participated in the game (excludes the host).
   */
  @ApiGameResultNumberOfPlayersProperty()
  numberOfPlayers: number

  /**
   * Total number of questions included in this game session.
   */
  @ApiGameResultNumberOfQuestionsProperty()
  numberOfQuestions: number

  /**
   * A list of players and their final performance metrics for a zero to one hundred mode game.
   */
  @ApiProperty({
    title: 'Player Metrics',
    description:
      'A list of players and their final performance metrics for a zero to one hundred mode game.',
    required: true,
    type: [GameResultZeroToOneHundredModePlayerMetricResponse],
  })
  @Min(GAME_MIN_PLAYERS)
  @Max(GAME_MAX_PLAYERS)
  @Type(() => GameResultZeroToOneHundredModePlayerMetricResponse)
  @ValidateNested({ each: true })
  playerMetrics: GameResultZeroToOneHundredModePlayerMetricResponse[]

  /**
   * A list of questions and their aggregated response metrics for a zero to one hundred mode game.
   */
  @ApiProperty({
    title: 'Question Metrics',
    description:
      'A list of questions and their aggregated response metrics for a zero to one hundred mode game.',
    required: true,
    type: [GameResultZeroToOneHundredModeQuestionMetricResponse],
  })
  @Min(QUIZ_QUESTION_MIN)
  @Max(QUIZ_QUESTION_MAX)
  @Type(() => GameResultZeroToOneHundredModeQuestionMetricResponse)
  @ValidateNested({ each: true })
  questionMetrics: GameResultZeroToOneHundredModeQuestionMetricResponse[]

  /**
   * The duration in seconds the game session was active.
   */
  @ApiGameResultDurationProperty()
  duration: number

  /**
   * The date and time when the game session was created.
   */
  @ApiGameResultCreatedProperty()
  created: Date
}
