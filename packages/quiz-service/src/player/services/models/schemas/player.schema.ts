import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Model } from 'mongoose'

/**
 * Mongoose schema for the Player collection.
 */
@Schema({ _id: true, collection: 'players' })
export class Player {
  /**
   * The unique identifier of the player.
   * Acts as the primary key in the database.
   */
  @Prop({ type: String, required: true })
  _id: string

  /**
   * The nickname of the player.
   *
   * This is a user-provided or system-generated identifier for the player.
   */
  @Prop({ type: String, required: false })
  nickname: string

  /**
   * The date and time when the player was created.
   */
  @Prop({ type: Date, required: true })
  created: Date

  /**
   * The date and time when the player's record was last modified.
   */
  @Prop({ type: Date, required: true })
  modified: Date
}

/**
 * Mongoose model type for the Player schema.
 */
export type PlayerModel = Model<Player>

/**
 * Schema factory for the Player class.
 */
export const PlayerSchema = SchemaFactory.createForClass(Player)
