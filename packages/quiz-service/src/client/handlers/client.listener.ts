import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'

import { Client, ClientModel } from '../services/models/schemas'

/**
 * Listens to events and triggers appropriate client-related logic.
 */
@Injectable()
export class ClientListener {
  /**
   * Initializes the ClientListener.
   *
   * @param clientModel - The Mongoose model for the Client schema.
   */
  constructor(@InjectModel(Client.name) private clientModel: ClientModel) {}

  /**
   * Handles the updated client association of a player.
   *
   * @param payload - The event payload containing the client ID and player ID.
   */
  @OnEvent('client.player.association.updated')
  public async handleUpdateClientPlayerAssociation({
    clientId,
    playerId,
  }: {
    clientId: string
    playerId: string
  }): Promise<void> {
    await this.clientModel
      .findByIdAndUpdate(clientId, { player: playerId })
      .exec()
  }
}
