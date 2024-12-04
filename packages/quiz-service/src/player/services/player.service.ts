import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { v4 as uuidv4 } from 'uuid'

import { PlayerNotFoundException } from '../exceptions'

import { Player, PlayerModel } from './models/schemas'

/**
 * Service for managing player-related operations.
 *
 * This service is responsible for creating new players and managing their data.
 */
@Injectable()
export class PlayerService {
  /**
   * Initializes the PlayerService.
   *
   * @param {PlayerModel} playerModel - The Mongoose model for the Player schema.
   * @param {Logger} logger - Logger instance for logging operations.
   */
  constructor(
    @InjectModel(Player.name) private playerModel: PlayerModel,
    private readonly logger: Logger = new Logger(PlayerService.name),
  ) {}

  /**
   * Creates a new player instance.
   *
   * Generates a new player document with a unique identifier and an empty nickname.
   *
   * @returns {Promise<Player>} The newly created player document.
   */
  public async createPlayer(): Promise<Player> {
    const created = new Date()

    const player = await new this.playerModel({
      _id: uuidv4(),
      nickname: '',
      created,
      modified: created,
    }).save()

    this.logger.log(`Created player with id '${player._id}.'`)

    return player
  }

  /**
   * Finds a player by their ID or throws an exception if not found.
   *
   * @param {string} playerId - The unique identifier of the player.
   *
   * @returns {Promise<Player>} The player document.
   *
   * @throws {PlayerNotFoundException} If the player is not found.
   */
  public async findPlayerOrThrow(playerId: string): Promise<Player> {
    const player = await this.playerModel.findById(playerId)

    if (!player) {
      this.logger.warn(`Player was not found by id '${playerId}.`)
      throw new PlayerNotFoundException(playerId)
    }

    return player
  }

  /**
   * Updates the nickname of an existing player.
   *
   * @param playerId - The unique ID of the player to update.
   * @param nickname - The new nickname to assign to the player.
   *
   * @returns A promise resolving to the updated player document.
   *
   * @throws {PlayerNotFoundException} If no player exists with the specified ID.
   */
  public async updatePlayer(
    playerId: string,
    nickname: string,
  ): Promise<Player> {
    const player = await this.playerModel.findById(playerId)

    if (!player) {
      this.logger.warn(`Player was not found by id '${playerId}.`)
      throw new PlayerNotFoundException(playerId)
    }

    player.nickname = nickname

    return player.save()
  }
}
