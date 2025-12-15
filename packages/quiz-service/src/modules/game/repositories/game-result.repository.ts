import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { buildGameResultModel } from '../services/utils'

import {
  GameDocument,
  GameResult,
  GameResultDocument,
  GameResultModel,
} from './models/schemas'

/**
 * Repository service for creating and storing game result documents.
 * Wraps access to the MongoDB GameResult collection.
 */
@Injectable()
export class GameResultRepository {
  // Logger for logging repository operations
  private logger: Logger = new Logger(GameResultRepository.name)

  /**
   * Creates a new instance of the GameResultRepository.
   *
   * @param gameResultModel - The injected Mongoose model for interacting with GameResult documents.
   */
  constructor(
    @InjectModel(GameResult.name) private gameResultModel: GameResultModel,
  ) {}

  /**
   * Builds a game result from a completed game and persists it to the database.
   *
   * @param gameDocument - The full game document containing all tasks and participants.
   * @returns A promise that resolves to the saved GameResult document.
   */
  public async createGameResult(
    gameDocument: GameDocument,
  ): Promise<GameResultDocument> {
    const gameResult = buildGameResultModel(gameDocument)
    return new this.gameResultModel(gameResult).save()
  }

  /**
   * Finds the result of a completed game by its game ID.
   *
   * @param gameID - The ID of the game to retrieve results for.
   * @returns The GameResult document if found, otherwise null.
   */
  public async findGameResult(gameID: string): Promise<GameResult> {
    return this.gameResultModel
      .findOne({
        game: { _id: gameID },
      })
      .populate([
        {
          path: 'game',
        },
      ])
  }

  /**
   * Updates all GameResult documents by replacing one participant’s ID with another.
   *
   * @param fromParticipantId  The participantId to replace.
   * @param toParticipantId    The new participantId to set.
   * @returns A Promise that resolves once all matching documents have been updated.
   */
  public async updateGameResultParticipant(
    fromParticipantId: string,
    toParticipantId: string,
  ): Promise<void> {
    this.logger.log(
      `Updating game result participant from '${fromParticipantId}' to '${toParticipantId}'.`,
    )

    try {
      await this.gameResultModel.updateMany(
        { hostParticipantId: fromParticipantId },
        { $set: { hostParticipantId: toParticipantId } },
      )

      await this.gameResultModel.updateMany(
        { 'players.participantId': fromParticipantId },
        { $set: { 'players.$.participantId': toParticipantId } },
      )
    } catch (error) {
      const { message, stack } = error as Error
      this.logger.warn(
        `Unable update game result participant from '${fromParticipantId} to '${toParticipantId}': ${message}`,
        stack,
      )
    }
  }
}
