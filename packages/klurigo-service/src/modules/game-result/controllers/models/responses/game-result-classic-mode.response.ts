import {
  GAME_MAX_PLAYERS,
  GAME_MIN_PLAYERS,
  GameMode,
  GameResultClassicModeDto,
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
import { ApiGameModeProperty } from '../../../../quiz-api/controllers/decorators/api'
import {
  ApiGameResultCreatedProperty,
  ApiGameResultDurationProperty,
  ApiGameResultNumberOfPlayersProperty,
  ApiGameResultNumberOfQuestionsProperty,
  ApiGameResultQuizProperty,
} from '../../decorators/api'

import { GameResultClassicModePlayerMetricResponse } from './game-result-classic-mode-player-metric.response'
import { GameResultClassicModeQuestionMetricResponse } from './game-result-classic-mode-question-metric.response'
import { GameResultParticipantResponse } from './game-result-participant.response'
import { GameResultQuizResponse } from './game-result-quiz.response'

/**
 * API response structure representing the final results of a completed game using the classic mode.
 */
export class GameResultClassicModeResponse implements GameResultClassicModeDto {
  /**
   * The unique identifier for the game.
   */
  @ApiGameIdProperty({
    description: 'The unique identifier for the game.',
  })
  id: string

  /**
   * The classic game mode of the quiz.
   */
  @ApiGameModeProperty(GameMode.Classic)
  mode: GameMode.Classic

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
   * A list of players and their final performance metrics for a classic mode game.
   */
  @ApiProperty({
    title: 'Player Metrics',
    description:
      'A list of players and their final performance metrics for a classic mode game.',
    required: true,
    type: [GameResultClassicModePlayerMetricResponse],
  })
  @Min(GAME_MIN_PLAYERS)
  @Max(GAME_MAX_PLAYERS)
  @Type(() => GameResultClassicModePlayerMetricResponse)
  @ValidateNested({ each: true })
  playerMetrics: GameResultClassicModePlayerMetricResponse[]

  /**
   * A list of questions and their aggregated response metrics for a classic mode game.
   */
  @ApiProperty({
    title: 'Question Metrics',
    description:
      'A list of questions and their aggregated response metrics for a classic mode game.',
    required: true,
    type: [GameResultClassicModeQuestionMetricResponse],
  })
  @Min(QUIZ_QUESTION_MIN)
  @Max(QUIZ_QUESTION_MAX)
  @Type(() => GameResultClassicModeQuestionMetricResponse)
  @ValidateNested({ each: true })
  questionMetrics: GameResultClassicModeQuestionMetricResponse[]

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
