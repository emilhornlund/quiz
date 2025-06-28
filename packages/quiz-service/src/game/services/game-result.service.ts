import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import {
  GameMode,
  GameResultClassicModePlayerMetricDto,
  GameResultClassicModeQuestionMetricDto,
  GameResultDto,
  GameResultPlayerMetricDto,
  GameResultQuestionMetricDto,
  GameResultZeroToOneHundredModePlayerMetricDto,
  GameResultZeroToOneHundredModeQuestionMetricDto,
} from '@quiz/common'

import { Cacheable } from '../../app/cache'
import { GameResultsNotFoundException } from '../exceptions'

import { GameResultRepository } from './game-result.repository'
import { PlayerMetric, QuestionMetric } from './models/schemas'

const CACHE_GAME_RESULTS_TTL = 60 * 60 // 1h in seconds

/**
 * Service for retrieving and formatting quiz game results.
 */
@Injectable()
export class GameResultService {
  /**
   * Constructs a new GameResultService.
   *
   * @param cacheManager - The cache manager used for caching responses.
   * @param gameResultRepository - Repository for accessing stored game results.
   */
  constructor(
    @Inject(CACHE_MANAGER) public readonly cacheManager: Cache,
    private readonly gameResultRepository: GameResultRepository,
  ) {}

  /**
   * Retrieves the result of a completed quiz game.
   *
   * @param gameID - The ID of the game to retrieve.
   * @returns The structured result of the game.
   * @throws GameResultsNotFoundException if the result is not found.
   */
  @Cacheable(CACHE_GAME_RESULTS_TTL)
  public async getGameResult(gameID: string): Promise<GameResultDto> {
    const gameResultDocument =
      await this.gameResultRepository.findGameResult(gameID)

    if (!gameResultDocument) {
      throw new GameResultsNotFoundException(gameID)
    }

    const {
      game: { _id: id, name, mode },
      hostParticipantId,
      players,
      questions,
      hosted: created,
      completed,
    } = gameResultDocument

    return {
      id,
      name,
      host: { id: hostParticipantId, nickname: 'N/A' },
      ...(mode === GameMode.Classic
        ? {
            mode: GameMode.Classic,
            playerMetrics: players.map(
              GameResultService.toClassicModePlayerMetricDto,
            ),
            questionMetrics: questions.map(
              GameResultService.toClassicModeQuestionMetricDto,
            ),
          }
        : {
            mode: GameMode.ZeroToOneHundred,
            playerMetrics: players.map(
              GameResultService.toZeroToOneHundredModePlayerMetricDto,
            ),
            questionMetrics: questions.map(
              GameResultService.toZeroToOneHundredModeQuestionMetricDto,
            ),
          }),
      duration: (completed.getTime() - created.getTime()) / 1000,
      created,
    }
  }

  /**
   * Maps a player metric to its base result DTO.
   *
   * @param playerMetric - The internal player metric entity.
   * @returns The base player metric DTO.
   * @private
   */
  private static toBasePlayerMetricDto(
    playerMetric: PlayerMetric,
  ): GameResultPlayerMetricDto {
    const {
      participantId: id,
      nickname,
      rank,
      unanswered,
      averageResponseTime,
      longestCorrectStreak,
      score,
    } = playerMetric
    return {
      player: { id, nickname },
      rank,
      unanswered,
      averageResponseTime,
      longestCorrectStreak,
      score,
    }
  }

  /**
   * Maps a player metric to its Classic Mode result DTO.
   *
   * @param playerMetric - The internal player metric entity.
   * @returns The Classic Mode player metric DTO.
   * @private
   */
  private static toClassicModePlayerMetricDto(
    playerMetric: PlayerMetric,
  ): GameResultClassicModePlayerMetricDto {
    const { correct, incorrect } = playerMetric
    return {
      ...GameResultService.toBasePlayerMetricDto(playerMetric),
      correct,
      incorrect,
    }
  }

  /**
   * Maps a player metric to its Zero-to-One-Hundred Mode result DTO.
   *
   * @param playerMetric - The internal player metric entity.
   * @returns The Zero-to-One-Hundred Mode player metric DTO.
   * @private
   */
  private static toZeroToOneHundredModePlayerMetricDto(
    playerMetric: PlayerMetric,
  ): GameResultZeroToOneHundredModePlayerMetricDto {
    const { averagePrecision } = playerMetric
    return {
      ...GameResultService.toBasePlayerMetricDto(playerMetric),
      averagePrecision,
    }
  }

  /**
   * Maps a question metric to its base result DTO.
   *
   * @param questionMetric - The internal question metric entity.
   * @returns The base question metric DTO.
   * @private
   */
  private static toBaseQuestionMetricDto(
    questionMetric: QuestionMetric,
  ): GameResultQuestionMetricDto {
    const { text, type, unanswered, averageResponseTime } = questionMetric
    return { text, type, unanswered, averageResponseTime }
  }

  /**
   * Maps a question metric to its Classic Mode result DTO.
   *
   * @param questionMetric - The internal question metric entity.
   * @returns The Classic Mode question metric DTO.
   * @private
   */
  private static toClassicModeQuestionMetricDto(
    questionMetric: QuestionMetric,
  ): GameResultClassicModeQuestionMetricDto {
    const { correct, incorrect } = questionMetric
    return {
      ...GameResultService.toBaseQuestionMetricDto(questionMetric),
      correct,
      incorrect,
    }
  }

  /**
   * Maps a question metric to its Zero-to-One-Hundred Mode result DTO.
   *
   * @param questionMetric - The internal question metric entity.
   * @returns The Zero-to-One-Hundred Mode question metric DTO.
   * @private
   */
  private static toZeroToOneHundredModeQuestionMetricDto(
    questionMetric: QuestionMetric,
  ): GameResultZeroToOneHundredModeQuestionMetricDto {
    const { averagePrecision } = questionMetric
    return {
      ...GameResultService.toBaseQuestionMetricDto(questionMetric),
      averagePrecision,
    }
  }
}
