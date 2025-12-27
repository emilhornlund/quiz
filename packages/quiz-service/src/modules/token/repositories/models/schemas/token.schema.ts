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
   * Identifier linking an access token and its corresponding refresh token.
   */
  @Prop({ type: String, required: true })
  pairId: string

  /**
   * Indicates whether the token is an access token or a refresh token.
   */
  @Prop({
    type: String,
    enum: Object.values(TokenType),
    required: true,
  })
  type: TokenType

  /**
   * Defines the functional area of the application for which this token grants access.
   */
  @Prop({
    type: String,
    enum: Object.values(TokenScope),
    required: true,
  })
  scope: TokenScope

  /**
   * The ID of the principal (user or game participant) to whom the token was issued.
   */
  @Prop({ type: String, required: true })
  principalId: string

  /**
   * The IP address from which the token was issued.
   */
  @Prop({ type: String, required: true })
  ipAddress: string

  /**
   * The User-Agent string of the client when the token was issued.
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
TokenSchema.index({ expiresAt: 1 })
