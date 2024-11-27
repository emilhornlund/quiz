import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'

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
   */
  constructor(@InjectModel(Client.name) private clientModel: ClientModel) {}

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

      const created = new Date()

      return new this.clientModel({
        _id: clientId,
        clientIdHash,
        created,
        modified: created,
      }).save()
    }

    return client
  }
}
