import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { PlayerLinkCodeResponseDto } from '@quiz/common'
import { Redis } from 'ioredis'
import { v4 as uuidv4 } from 'uuid'

import { Client } from '../../client/services/models/schemas'
import { PlayerLinkCodeNotFoundException } from '../exceptions'
import { PlayerNotFoundException } from '../exceptions'

import { Player, PlayerModel } from './models/schemas'
import { generateNickname } from './utils'

const PLAYER_LINK_CODE_PREFIX = 'player-link-code'

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
   * @param {Redis} redis - Redis instance handling player link codes.
   * @param {PlayerModel} playerModel - The Mongoose model for the Player schema.
   * @param {Logger} logger - Logger instance for logging operations.
   */
  constructor(
    @InjectRedis() private readonly redis: Redis,
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
      nickname: generateNickname(),
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
   * Finds a player by their link code or throws an exception if not found.
   *
   * @param {string} code - The player link code.
   *
   * @returns {Promise<Player>} The player associated with the provided link code.
   *
   * @throws {PlayerLinkCodeNotFoundException} Thrown if the link code is not found.
   */
  public async findPlayerByLinkCodeOrThrow(code: string): Promise<Player> {
    const playerId = await this.redis.get(`${PLAYER_LINK_CODE_PREFIX}:${code}`)
    if (!playerId) {
      throw new PlayerLinkCodeNotFoundException()
    }
    await this.redis.del(`${PLAYER_LINK_CODE_PREFIX}:${code}`)
    return this.findPlayerOrThrow(playerId)
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

  /**
   * Generates a unique player link code and stores it in Redis.
   *
   * @param {Client} client - The client for which player the link code is generated.
   *
   * @returns {PlayerLinkCodeResponseDto} The generated link code and its expiration details.
   */
  public async generateLinkCode(
    client: Client,
  ): Promise<PlayerLinkCodeResponseDto> {
    const generate = (): string => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      const getRandomChar = () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      const part = () => Array.from({ length: 4 }, getRandomChar).join('')
      return `${part()}-${part()}`
    }

    const EXPIRATION_TIME = 60 * 10 // Expiration time in seconds (10 minutes)

    let code = generate()
    while (await this.redis.exists(`${PLAYER_LINK_CODE_PREFIX}:${code}`)) {
      code = generate()
    }

    await this.redis.set(
      `${PLAYER_LINK_CODE_PREFIX}:${code}`,
      client.player._id,
      'EX',
      EXPIRATION_TIME,
    )

    return {
      code,
      expires: new Date(Date.now() + EXPIRATION_TIME * 1000),
    }
  }
}
