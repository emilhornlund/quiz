import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { v4 as uuidv4 } from 'uuid'

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
   */
  constructor(@InjectModel(Player.name) private playerModel: PlayerModel) {}

  /**
   * Creates a new player instance.
   *
   * Generates a new player document with a unique identifier and an empty nickname.
   *
   * @returns {Promise<Player>} The newly created player document.
   */
  public async createPlayer(): Promise<Player> {
    const created = new Date()
    return new this.playerModel({
      _id: uuidv4(),
      nickname: '',
      created,
      modified: created,
    }).save()
  }
}
