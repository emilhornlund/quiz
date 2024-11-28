import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Model } from 'mongoose'

import { Player } from '../../../../player/services/models/schemas'

/**
 * Mongoose schema for the Client collection.
 */
@Schema({ collection: 'clients' })
export class Client extends Document {
  /**
   * The unique identifier of the client.
   * Acts as the primary key in the database.
   */
  @Prop({ type: String, required: true })
  _id: string

  /**
   * The hashed version of the client's ID.
   * Used as the `sub` claim in JWT tokens.
   */
  @Prop({ type: String, required: true })
  clientIdHash: string

  /**
   * The player document associated with the client.
   *
   * Stores a reference to a Player document to link clients with their player profiles.
   */
  @Prop({ type: String, ref: 'Player' })
  player: Player

  /**
   * The date and time when the client was created.
   */
  @Prop({ type: Date, required: true })
  created: Date

  /**
   * The date and time when the client's record was last modified.
   */
  @Prop({ type: Date, required: true })
  modified: Date
}

/**
 * Mongoose model type for the Client schema.
 */
export type ClientModel = Model<Client>

/**
 * Schema factory for the Client class.
 */
export const ClientSchema = SchemaFactory.createForClass(Client)
