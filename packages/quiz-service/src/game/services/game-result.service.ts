import { Injectable } from '@nestjs/common'
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

import { UserRepository } from '../../user/repositories'
import { GameResultsNotFoundException } from '../exceptions'
import { GameResultRepository } from '../repositories'
import { PlayerMetric, QuestionMetric } from '../repositories/models/schemas'

/**
 * Service for retrieving and formatting quiz game results.
 */
@Injectable()
export class GameResultService {
  /**
   * Constructs a new GameResultService.
   *
   * @param gameResultRepository - Repository for accessing stored game results.
   * @param userRepository - Repository for accessing user data.
   */
  constructor(
    private readonly gameResultRepository: GameResultRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Retrieves the result of a completed quiz game.
   * Player metrics are filtered to include:
   * - Top 5 by rank, and
   * - The requesting participant’s own metrics (if not already in the top 5).
   *
   * @param gameID - The ID of the game to retrieve.
   * @param participantId - participantId The authenticated participant’s ID. Used to ensure
   * the caller’s metric is included even if outside the top 5.
   *
   * @returns The structured result of the game.
   *
   * @throws GameResultsNotFoundException if the result is not found.
   */
  public async getGameResult(
    gameID: string,
    participantId: string,
  ): Promise<GameResultDto> {
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

    const hostUser = await this.userRepository.findUserById(hostParticipantId)

    return {
      id,
      name,
      host: {
        id: hostParticipantId,
        nickname: hostUser?.defaultNickname || 'N/A',
      },
      numberOfPlayers: players.length,
      numberOfQuestions: questions.length,
      ...(mode === GameMode.Classic
        ? {
            mode: GameMode.Classic,
            playerMetrics: players
              .map(GameResultService.toClassicModePlayerMetricDto)
              .filter((metric) =>
                GameResultService.playerMetricFilter(metric, participantId),
              )
              .sort((a, b) => a.rank - b.rank),
            questionMetrics: questions.map(
              GameResultService.toClassicModeQuestionMetricDto,
            ),
          }
        : {
            mode: GameMode.ZeroToOneHundred,
            playerMetrics: players
              .map(GameResultService.toZeroToOneHundredModePlayerMetricDto)
              .filter((metric) =>
                GameResultService.playerMetricFilter(metric, participantId),
              )
              .sort((a, b) => a.rank - b.rank),
            questionMetrics: questions.map(
              GameResultService.toZeroToOneHundredModeQuestionMetricDto,
            ),
          }),
      duration: (completed.getTime() - created.getTime()) / 1000,
      created,
    }
  }

  /**
   * Returns whether a player metric should be included in the response.
   *
   * Inclusion rule:
   * - Include ranks 1–5 (top 5), OR
   * - Include the requesting participant’s metric (by `participantId`) regardless of rank.
   *
   * @param playerMetricDto A player’s metric DTO.
   * @param participantId The authenticated participant’s ID.
   *
   * @returns `true` if the metric should be included; otherwise `false`.
   *
   * @private
   */
  private static playerMetricFilter(
    playerMetricDto: GameResultPlayerMetricDto,
    participantId: string,
  ): boolean {
    const { rank, player } = playerMetricDto
    return (rank > 0 && rank <= 5) || player.id === participantId
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
