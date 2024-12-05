import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcryptjs'

import { PlayerService } from '../../player/services'
import {
  ClientByIdHashNotFoundException,
  ClientByIdNotFoundException,
} from '../exceptions'

import { Client, ClientModel } from './models/schemas'

/**
 * Service responsible for managing client data.
 */
@Injectable()
export class ClientService {
  /**
   * Initializes the ClientService.
   *
   * @param {ClientModel} clientModel - The Mongoose model for the Client schema.
   * @param {PlayerService} playerService - Service to handle player-related operations such as creating and managing players associated with a client.
   * @param {Logger} logger - Logger instance for logging operations.
   */
  constructor(
    @InjectModel(Client.name) private clientModel: ClientModel,
    private playerService: PlayerService,
    private readonly logger: Logger = new Logger(ClientService.name),
  ) {}

  /**
   * Finds an existing client by their ID or creates a new one if not found.
   *
   * @param {string} clientId - The unique identifier of the client.
   *
   * @returns {Promise<Client>} The existing or newly created client document.
   */
  public async findOrCreateClient(clientId: string): Promise<Client> {
    let client = await this.clientModel.findById(clientId).populate('player')

    if (!client) {
      const salt = await bcrypt.genSalt()
      const clientIdHash = await bcrypt.hash(clientId, salt)

      const player = await this.playerService.createPlayer()

      const created = new Date()

      client = await new this.clientModel({
        _id: clientId,
        clientIdHash,
        player,
        created,
        modified: created,
      }).save()

      this.logger.log(`Created client with id '${client._id}.'`)
    }

    return client
  }

  /**
   * Finds a client by its ID or throws an exception if not found.
   *
   * @param {string} clientId - The ID of the client to find.
   *
   * @returns {Promise<Client>} The client document.
   *
   * @throws {ClientByIdNotFoundException} If the client is not found.
   */
  public async findByClientIdOrThrow(clientId: string): Promise<Client> {
    const client = await this.clientModel.findById(clientId).populate('player')

    if (!client) {
      this.logger.warn(`Client was not found by id '${clientId}.`)
      throw new ClientByIdNotFoundException(clientId)
    }

    return client
  }

  /**
   * Finds a client by their hashed ID or throws an exception if not found.
   *
   * @param {string} clientIdHash - The hashed ID of the client.
   *
   * @returns {Promise<Client>} The client document.
   *
   * @throws {ClientByIdHashNotFoundException} If the client is not found.
   */
  public async findByClientIdHashOrThrow(
    clientIdHash: string,
  ): Promise<Client> {
    const client = await this.clientModel
      .findOne({ clientIdHash })
      .populate('player')

    if (!client) {
      this.logger.warn(`Client was not found by hashed id '${clientIdHash}.`)
      throw new ClientByIdHashNotFoundException(clientIdHash)
    }

    return client
  }
}
