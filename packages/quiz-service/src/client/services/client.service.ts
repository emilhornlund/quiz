import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'

import { PlayerService } from '../../player/services'

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
   */
  constructor(
    @InjectModel(Client.name) private clientModel: ClientModel,
    private playerService: PlayerService,
  ) {}

  /**
   * Finds an existing client by their ID or creates a new one if not found.
   *
   * @param {string} clientId - The unique identifier of the client.
   *
   * @returns {Promise<Client>} The existing or newly created client document.
   */
  public async findOrCreateClient(clientId: string): Promise<Client> {
    const client = await this.clientModel.findById(clientId)

    if (!client) {
      const salt = await bcrypt.genSalt()
      const clientIdHash = await bcrypt.hash(clientId, salt)

      const player = await this.playerService.createPlayer()

      const created = new Date()

      return new this.clientModel({
        _id: clientId,
        clientIdHash,
        player,
        created,
        modified: created,
      }).save()
    }

    return client
  }
}
