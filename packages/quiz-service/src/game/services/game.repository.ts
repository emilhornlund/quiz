import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

import {
  ActiveGameNotFoundByGamePINException,
  ActiveGameNotFoundByIDException,
  NicknameAlreadyTakenException,
} from '../exceptions'

import { Game, GameDocument, PartialGameModel, Player } from './models/schemas'
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
   */
  constructor(@InjectModel(Game.name) private gameModel: Model<Game>) {}

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
    return this.gameModel.findOne({
      _id: gameID,
      ...(active ? { expires: { $gt: new Date(Date.now()) } } : {}),
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
      ...(active ? { expires: { $gt: new Date(Date.now()) } } : {}),
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
   * Generates a unique 6-digit game PIN. It checks the database to ensure that no other game
   * with the same PIN was created within the last 6 hours. If such a game exists, it keeps generating
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
   * @param {PartialGameModel} game - The partial game data to create the game document.
   *
   * @returns {Promise<GameDocument>} A promise that resolves to the saved GameDocument.
   */
  public async createGame(game: PartialGameModel): Promise<GameDocument> {
    const gamePIN = await this.generateUniqueGamePIN()

    return new this.gameModel(buildGameModel(game, gamePIN)).save()
  }

  /**
   * Adds a new player to a game.
   *
   * @param {string} gameID - The ID of the game to add the player to.
   * @param {string} nickname - The nickname of the player to add.
   *
   * @returns {Promise<[GameDocument, Player]>} A promise that resolves to a tuple of the updated GameDocument and the new Player.
   *
   * @throws {NicknameAlreadyTakenException} if the nickname is already used by another player.
   */
  public async addPlayer(
    gameID: string,
    nickname: string,
  ): Promise<[GameDocument, Player]> {
    const gameDocument = await this.findGameByIDOrThrow(gameID)

    if (gameDocument.players.some((player) => player.nickname === nickname)) {
      throw new NicknameAlreadyTakenException(nickname)
    }

    const newPlayer: Player = {
      _id: uuidv4(),
      nickname,
      joined: new Date(),
    }

    gameDocument.players.push(newPlayer)

    const savedGameDocument = await gameDocument.save()

    return [savedGameDocument, newPlayer]
  }
}
