import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { GameStatus } from '@quiz/common'
import { Model, RootFilterQuery } from 'mongoose'
import { MurLock } from 'murlock'

import { BaseRepository } from '../../app/shared/repository'
import { User } from '../../modules/user/repositories'
import { Quiz } from '../../quiz/repositories/models/schemas'
import {
  ActiveGameNotFoundByGamePINException,
  ActiveGameNotFoundByIDException,
  GameNotFoundException,
} from '../exceptions'
import { buildGameModel } from '../services/utils'
import { buildQuitTask } from '../services/utils/tasks'

import { Game, GameDocument, TaskType } from './models/schemas'

/**
 * Repository for interacting with the Game collection in the database.
 *
 * Extends BaseRepository to provide common CRUD operations and adds game-specific methods.
 */
@Injectable()
export class GameRepository extends BaseRepository<Game> {
  /**
   * Constructs the GameRepository.
   *
   * @param {Model<Game>} gameModel - The Mongoose model representing the Game schema.
   */
  constructor(
    @InjectModel(Game.name) protected readonly gameModel: Model<Game>,
  ) {
    super(gameModel, 'Game')
  }

  /**
   * Finds a game by its ID.
   *
   * @param {string} gameID - The ID of the game to find.
   * @param {boolean} active - Whether to filter by active games (default: true).
   *
   * @returns {Promise<GameDocument | null>} A promise that resolves to a GameDocument or null if not found.
   */
  public async findGameByID(
    gameID: string,
    active: boolean = true,
  ): Promise<GameDocument | null> {
    const filter = {
      _id: gameID,
      ...(active ? { status: GameStatus.Active } : {}),
    }

    return this.gameModel
      .findOne(filter)
      .populate('quiz') as Promise<GameDocument | null>
  }

  /**
   * Finds a game by its ID and throws an exception if not found.
   *
   * @param {string} gameID - The ID of the game to find.
   * @param {boolean} active - Whether to filter by active games (default: true).
   *
   * @returns {Promise<GameDocument>} A promise that resolves to a GameDocument.
   *
   * @throws {ActiveGameNotFoundByIDException} if no active game is found.
   */
  public async findGameByIDOrThrow(
    gameID: string,
    active: boolean = true,
  ): Promise<GameDocument> {
    const gameDocument = await this.findGameByID(gameID, active)

    if (!gameDocument) {
      if (active) {
        throw new ActiveGameNotFoundByIDException(gameID)
      }
      throw new GameNotFoundException(gameID)
    }

    return gameDocument
  }

  /**
   * Finds a game by its PIN.
   *
   * @param {string} gamePIN - The unique 6-digit game PIN of the game to find.
   * @param {boolean} active - Whether to filter by active games (default: true).
   *
   * @returns {Promise<GameDocument | null>} A promise that resolves to a GameDocument or null if not found.
   */
  public async findGameByPIN(
    gamePIN: string,
    active: boolean = true,
  ): Promise<GameDocument | null> {
    const filter = {
      pin: gamePIN,
      ...(active ? { status: { $eq: GameStatus.Active } } : {}),
    }

    return this.gameModel
      .findOne(filter)
      .populate('quiz') as Promise<GameDocument | null>
  }

  /**
   * Finds a game by its PIN and throws an exception if not found.
   *
   * @param {string} gamePIN - The unique 6-digit game PIN of the game to find.
   * @param {boolean} active - Whether to filter by active games (default: true).
   *
   * @returns {Promise<GameDocument>} A promise that resolves to a GameDocument.
   *
   * @throws {ActiveGameNotFoundByGamePINException} if no active game is found.
   */
  public async findGameByPINOrThrow(
    gamePIN: string,
    active: boolean = true,
  ): Promise<GameDocument> {
    const gameDocument = await this.findGameByPIN(gamePIN, active)

    if (!gameDocument) {
      throw new ActiveGameNotFoundByGamePINException(gamePIN)
    }

    return gameDocument
  }

  /**
   * Finds a game by its ID, updates it using the provided callback, and saves the changes.
   *
   * @param {string} gameID - The ID of the game to find and update.
   * @param {Function} callback - A callback function to modify the game document.
   *
   * @returns {Promise<GameDocument>} A promise that resolves to the updated `GameDocument`.
   *
   * @throws {ActiveGameNotFoundByIDException} If no active game is found.
   */
  @MurLock(5000, 'game', 'gameID')
  public async findAndSaveWithLock(
    gameID: string,
    callback: (gameDocument: GameDocument) => Promise<GameDocument>,
  ): Promise<GameDocument> {
    const gameDocument = await this.findGameByIDOrThrow(gameID)

    const updatedGameDocument = await callback(gameDocument)
    updatedGameDocument.updated = new Date()
    return await updatedGameDocument.save()
  }

  /**
   * Finds games associated with a specific participant ID.
   *
   * @param participantId - The ID of the participant.
   * @param offset - The number of games to skip for pagination.
   * @param limit - The maximum number of games to return.
   * @returns An object containing the list of games and the total number of matching games.
   */
  public async findGamesByParticipantId(
    participantId: string,
    offset: number = 0,
    limit: number = 5,
  ): Promise<{
    results: GameDocument[]
    total: number
  }> {
    const filter: RootFilterQuery<Game> = {
      status: { $in: [GameStatus.Completed, GameStatus.Active] },
      'participants.participantId': participantId,
    }

    const result = await this.findWithPagination(filter, {
      skip: offset,
      limit,
      sort: { status: 1, created: -1 },
      populate: 'quiz',
    })

    return {
      results: result.documents as GameDocument[],
      total: result.total,
    }
  }

  /**
   * Generates a unique 6-digit game PIN. It checks the database to ensure that no other active game
   * with the same PIN exists. If such a game exists, it keeps generating
   * new PINs until a unique one is found.
   *
   * @returns {Promise<string>} A Promise that resolves with a unique 6-digit game PIN.
   *
   * @private
   */
  private async generateUniqueGamePIN(): Promise<string> {
    let isUnique = false
    let gamePIN: string

    while (!isUnique) {
      gamePIN = Math.floor(100000 + Math.random() * 900000).toString()

      const existingGame = await this.findGameByPIN(gamePIN)

      if (!existingGame) {
        isUnique = true
      }
    }

    return gamePIN
  }

  /**
   * Creates and saves a new game.
   *
   * @param quiz - The quiz document.
   * @param user - The user object representing the host creating the game.
   *
   * @returns A promise that resolves to the saved GameDocument.
   */
  public async createGame(quiz: Quiz, user: User): Promise<GameDocument> {
    const gamePIN = await this.generateUniqueGamePIN()

    const game = buildGameModel(quiz, gamePIN, user)

    return this.create(game) as Promise<GameDocument>
  }

  /**
   * Marks stale games as 'Completed' if they:
   * - Are still marked as 'Active'
   * - Are currently in the 'Podium' task
   * - Have not been updated in over 1 hour
   *
   * @returns Number of games successfully updated to 'Completed'
   */
  public async updateCompletedGames(): Promise<number> {
    const filter = {
      status: GameStatus.Active,
      'currentTask.type': TaskType.Podium,
      updated: { $lt: new Date(Date.now() - 60 * 60 * 1000) },
    }

    const quitTask = buildQuitTask()

    return this.updateMany(filter, [
      {
        $set: {
          previousTasks: {
            $concatArrays: ['$previousTasks', ['$currentTask']],
          },
          currentTask: quitTask,
          status: GameStatus.Completed,
        },
      },
    ])
  }

  /**
   * Marks stale games as 'Expired' if they:
   * - Are still marked as 'Active'
   * - Are currently not in the 'Podium' or 'Quit' task
   * - Have not been updated in over 1 hour
   *
   * @returns Number of games successfully updated to 'Expired'
   */
  public async updateExpiredGames(): Promise<number> {
    const filter = {
      status: GameStatus.Active,
      'currentTask.type': { $nin: [TaskType.Podium, TaskType.Quit] },
      updated: { $lt: new Date(Date.now() - 60 * 60 * 1000) },
    }

    const quitTask = buildQuitTask()

    return this.updateMany(filter, [
      {
        $set: {
          previousTasks: {
            $concatArrays: ['$previousTasks', ['$currentTask']],
          },
          currentTask: quitTask,
          status: GameStatus.Expired,
        },
      },
    ])
  }

  /**
   * Deletes all games that are associated with the given quiz ID.
   *
   * @param {string} quizId - The unique identifier of the quiz.
   * @returns {Promise<number>} - The number of deleted game documents.
   */
  public async deleteGamesByQuizId(quizId: string): Promise<number> {
    return this.deleteMany({
      quiz: quizId,
    })
  }

  /**
   * Replace every occurrence of one participantId with another across all game documents.
   *
   * @param fromParticipantId - the participantId to search for
   * @param toParticipantId - the participantId to replace it with
   * @returns a promise that resolves once all updates have been committed (or rejects/aborts on error)
   */
  public async updateGameParticipant(
    fromParticipantId: string,
    toParticipantId: string,
  ): Promise<void> {
    this.logger.log(
      `Updating game participant from '${fromParticipantId}' to '${toParticipantId}'.`,
    )

    try {
      const updates = [
        // 1) participants[].participantId
        this.gameModel.updateMany(
          { 'participants.participantId': fromParticipantId },
          {
            $set: {
              'participants.$[p].participantId': toParticipantId,
            },
          },
          {
            arrayFilters: [{ 'p.participantId': fromParticipantId }],
          },
        ),

        // 2a) QuestionResult currentTask → currentTask.results[].playerId
        this.gameModel.updateMany(
          {
            'currentTask.type': TaskType.QuestionResult,
            'currentTask.results.playerId': fromParticipantId,
          },
          {
            $set: {
              'currentTask.results.$[res].playerId': toParticipantId,
            },
          },
          {
            arrayFilters: [{ 'res.playerId': fromParticipantId }],
            strict: false,
          },
        ),

        // 2b) QuestionResult tasks → previousTasks[].results[].playerId
        this.gameModel.updateMany(
          {
            'previousTasks.type': TaskType.QuestionResult,
            'previousTasks.results.playerId': fromParticipantId,
          },
          {
            $set: {
              'previousTasks.$[task].results.$[res].playerId': toParticipantId,
            },
          },
          {
            arrayFilters: [
              {
                'task.type': TaskType.QuestionResult,
                'task.results.playerId': fromParticipantId,
              },
              { 'res.playerId': fromParticipantId },
            ],
          },
        ),

        // 3a) QuestionResult currentTask → currentTask.results[].answer.playerId
        this.gameModel.updateMany(
          {
            'currentTask.type': TaskType.QuestionResult,
            'currentTask.results.answer.playerId': fromParticipantId,
          },
          {
            $set: {
              'currentTask.results.$[res].answer.playerId': toParticipantId,
            },
          },
          {
            arrayFilters: [{ 'res.answer.playerId': fromParticipantId }],
            strict: false,
          },
        ),

        // 3b) QuestionResult tasks → previousTasks[].results[].answer.playerId
        this.gameModel.updateMany(
          {
            'previousTasks.type': TaskType.QuestionResult,
            'previousTasks.results.answer.playerId': fromParticipantId,
          },
          {
            $set: {
              'previousTasks.$[task].results.$[res].answer.playerId':
                toParticipantId,
            },
          },
          {
            arrayFilters: [
              {
                'task.type': TaskType.QuestionResult,
                'task.results.answer.playerId': fromParticipantId,
              },
              { 'res.answer.playerId': fromParticipantId },
            ],
          },
        ),

        // 4a) Question currentTask → currentTask.answers[].playerId
        this.gameModel.updateMany(
          {
            'currentTask.type': TaskType.Question,
            'currentTask.answers.playerId': fromParticipantId,
          },
          {
            $set: {
              'currentTask.answers.$[res].playerId': toParticipantId,
            },
          },
          {
            arrayFilters: [{ 'res.playerId': fromParticipantId }],
            strict: false,
          },
        ),

        // 4b) Question tasks → previousTasks[].answers[].playerId
        this.gameModel.updateMany(
          {
            'previousTasks.type': TaskType.Question,
            'previousTasks.answers.playerId': fromParticipantId,
          },
          {
            $set: {
              'previousTasks.$[task].answers.$[res].playerId': toParticipantId,
            },
          },
          {
            arrayFilters: [
              {
                'task.type': TaskType.Question,
                'task.answers.playerId': fromParticipantId,
              },
              { 'res.playerId': fromParticipantId },
            ],
          },
        ),

        // 5a) Leaderboard currentTask → currentTask.leaderboard[].playerId
        this.gameModel.updateMany(
          {
            'currentTask.type': TaskType.Leaderboard,
            'currentTask.leaderboard.playerId': fromParticipantId,
          },
          {
            $set: {
              'currentTask.leaderboard.$[entry].playerId': toParticipantId,
            },
          },
          {
            arrayFilters: [{ 'entry.playerId': fromParticipantId }],
            strict: false,
          },
        ),

        // 5b) Leaderboard tasks → previousTasks[].leaderboard[].playerId
        this.gameModel.updateMany(
          {
            'previousTasks.type': TaskType.Leaderboard,
            'previousTasks.leaderboard.playerId': fromParticipantId,
          },
          {
            $set: {
              'previousTasks.$[task].leaderboard.$[entry].playerId':
                toParticipantId,
            },
          },
          {
            arrayFilters: [
              {
                'task.type': TaskType.Leaderboard,
                'task.leaderboard.playerId': fromParticipantId,
              },
              { 'entry.playerId': fromParticipantId },
            ],
          },
        ),

        // 6a) Podium currentTask → currentTask.leaderboard[].playerId
        this.gameModel.updateMany(
          {
            'currentTask.type': TaskType.Podium,
            'currentTask.leaderboard.playerId': fromParticipantId,
          },
          {
            $set: {
              'currentTask.leaderboard.$[entry].playerId': toParticipantId,
            },
          },
          {
            arrayFilters: [{ 'entry.playerId': fromParticipantId }],
            strict: false,
          },
        ),

        // 6b) Podium tasks → previousTasks[].leaderboard[].playerId
        this.gameModel.updateMany(
          {
            'previousTasks.type': TaskType.Podium,
            'previousTasks.leaderboard.playerId': fromParticipantId,
          },
          {
            $set: {
              'previousTasks.$[task].leaderboard.$[entry].playerId':
                toParticipantId,
            },
          },
          {
            arrayFilters: [
              {
                'task.type': TaskType.Podium,
                'task.leaderboard.playerId': fromParticipantId,
              },
              { 'entry.playerId': fromParticipantId },
            ],
          },
        ),
      ]

      // fire all updates in parallel
      await Promise.all(updates)
    } catch (error) {
      const { message, stack } = error as Error
      this.logger.warn(
        `Unable to update game participant from '${fromParticipantId}' to '${toParticipantId}': ${message}`,
        stack,
      )
      throw error
    }
  }
}
