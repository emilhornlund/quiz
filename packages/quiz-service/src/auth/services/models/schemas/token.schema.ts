import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { TokenScope, TokenType } from '@quiz/common'
import { Model } from 'mongoose'

/**
 * Mongoose schema for the Token collection.
 */
@Schema({
  _id: true,
  collection: 'tokens',
})
export class Token {
  /**
   * The unique identifier of the token.
   * Acts as the primary key in the database.
   */
  @Prop({ type: String, required: true })
  _id: string

  /**
   * description here
   */
  @Prop({ type: String, required: true })
  pairId: string

  /**
   * description here
   */
  @Prop({
    type: String,
    enum: Object.values(TokenType),
    required: true,
  })
  type: TokenType

  /**
   * description here
   */
  @Prop({
    type: String,
    enum: Object.values(TokenScope),
    required: true,
  })
  scope: TokenScope

  /**
   * description here
   */
  @Prop({ type: String, required: true })
  principalId: string

  /**
   * description here
   */
  @Prop({ type: String, required: true })
  ipAddress: string

  /**
   * description here
   */
  @Prop({ type: String, required: true })
  userAgent: string

  /**
   * Timestamp when the token was created (ISO-8601 string).
   */
  @Prop({ type: Date, required: true })
  createdAt: Date

  /**
   * Timestamp when the token is to expire (ISO-8601 string).
   */
  @Prop({ type: Date, required: true })
  expiresAt: Date
}

/**
 * Mongoose model type for the Token schema.
 */
export type TokenModel = Model<Token>

/**
 * Schema factory for the Token class.
 */
export const TokenSchema = SchemaFactory.createForClass(Token)
