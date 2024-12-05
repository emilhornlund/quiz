import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { GameParticipantType } from '@quiz/common'
import { Model } from 'mongoose'
import { MurLock } from 'murlock'

import { Client } from '../../client/services/models/schemas'
import {
  ActiveGameNotFoundByGamePINException,
  ActiveGameNotFoundByIDException,
  NicknameAlreadyTakenException,
} from '../exceptions'

import { GameEventPublisher } from './game-event.publisher'
import {
  Game,
  GameDocument,
  PartialGameModel,
  Participant,
  ParticipantPlayer,
} from './models/schemas'
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
        ...(active ? { expires: { $gt: new Date(Date.now()) } } : {}),
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
    callback: (gameDocument: GameDocument) => GameDocument,
  ): Promise<GameDocument> {
    const gameDocument = await this.findGameByIDOrThrow(gameID)

    const savedGameDocument = await callback(gameDocument).save()

    await this.gameEventPublisher.publish(savedGameDocument)

    return savedGameDocument
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
   * @param {Client} client - The client object representing the host creating the game.
   *
   * @returns {Promise<GameDocument>} A promise that resolves to the saved GameDocument.
   */
  public async createGame(
    game: PartialGameModel,
    client: Client,
  ): Promise<GameDocument> {
    const gamePIN = await this.generateUniqueGamePIN()

    return new this.gameModel(buildGameModel(game, gamePIN, client)).save()
  }

  /**
   * Adds a new player to a game and publishes an event after the player is added.
   *
   * @param {string} gameID - The ID of the game to add the player to.
   * @param {Client} client - The client object representing the player joining the game.
   *
   * @returns {Promise<GameDocument>} A promise that resolves to the updated GameDocument.
   *
   * @throws {NicknameAlreadyTakenException} if the nickname is already used by another player.
   */
  public async addPlayer(
    gameID: string,
    client: Client,
  ): Promise<GameDocument> {
    const now = new Date()

    const newParticipant: Participant & ParticipantPlayer = {
      type: GameParticipantType.PLAYER,
      client,
      totalScore: 0,
      currentStreak: 0,
      created: now,
      updated: now,
    }

    return this.findAndSaveWithLock(gameID, (currentDocument) => {
      if (
        currentDocument.participants.some(
          (participant) =>
            participant.client.player.nickname === client.player.nickname,
        )
      ) {
        throw new NicknameAlreadyTakenException(client.player.nickname)
      }

      currentDocument.participants.push(newParticipant)

      return currentDocument
    })
  }
}
