import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { MurLock } from 'murlock'

import { Client } from '../../client/services/models/schemas'
import { Quiz } from '../../quiz/services/models/schemas'
import {
  ActiveGameNotFoundByGamePINException,
  ActiveGameNotFoundByIDException,
} from '../exceptions'

import { GameEventPublisher } from './game-event.publisher'
import { Game, GameDocument, GameStatus } from './models/schemas'
import { buildGameModel } from './utils'

/**
 * Repository for interacting with the Game collection in the database.
 */
@Injectable()
export class GameRepository {
  /**
   * Constructs the GameRepository.
   *
   * @param {Model<Game>} gameModel - The Mongoose model representing the Game schema.
   * @param {GameEventPublisher} gameEventPublisher - Service responsible for publishing game events to clients.
   */
  constructor(
    @InjectModel(Game.name) private gameModel: Model<Game>,
    private gameEventPublisher: GameEventPublisher,
  ) {}

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
    return this.gameModel
      .findOne({
        _id: gameID,
        ...(active ? { status: GameStatus.Active } : {}),
      })
      .populate({
        path: 'participants',
        populate: {
          path: 'client',
          model: 'Client',
          populate: {
            path: 'player',
            model: 'Player',
          },
        },
      })
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
      throw new ActiveGameNotFoundByIDException(gameID)
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
    return this.gameModel.findOne({
      pin: gamePIN,
      ...(active ? { status: { $eq: GameStatus.Active } } : {}),
    })
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
    const savedGameDocument = await updatedGameDocument.save()

    await this.gameEventPublisher.publish(savedGameDocument)

    return savedGameDocument
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
   * @param {Quiz} quiz - The quiz document.
   * @param {Client} client - The client object representing the host creating the game.
   *
   * @returns {Promise<GameDocument>} A promise that resolves to the saved GameDocument.
   */
  public async createGame(quiz: Quiz, client: Client): Promise<GameDocument> {
    const gamePIN = await this.generateUniqueGamePIN()

    const game = buildGameModel(quiz, gamePIN, client)

    return new this.gameModel(game).save()
  }
}
