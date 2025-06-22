import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Model, now } from 'mongoose'

/**
 * Which authentication provider created this account. *
 * Values:
 * - `LOCAL`: email/password stored locally
 */
export enum AuthProvider {
  Local = 'LOCAL',
}

/**
 * Mongoose schema for the User collection.
 */
@Schema({
  _id: true,
  collection: 'users',
  discriminatorKey: 'provider',
  timestamps: true,
})
export class User {
  /**
   * The unique identifier of the user.
   * Acts as the primary key in the database.
   */
  @Prop({ type: String, required: true })
  _id: string

  /**
   * Authentication provider.
   * Stored as one of the AuthProvider values (e.g. `"LOCAL"`).
   */
  @Prop({
    type: String,
    enum: Object.values(AuthProvider),
    required: true,
  })
  provider!: AuthProvider.Local

  /**
   * The user’s unique email address.
   */
  @Prop({ type: String, unique: true, required: true })
  email: string

  /**
   * Optional given name (first name) of the user.
   */
  @Prop({ type: String, required: false })
  givenName?: string

  /**
   * Optional family name (last name) of the user.
   */
  @Prop({ type: String, required: false })
  familyName?: string

  /**
   * Optional default nickname of the user used for when participating in games.
   */
  @Prop({ type: String, required: false })
  defaultNickname?: string

  /**
   * Timestamp when the user was created (ISO-8601 string).
   */
  @Prop({ type: Date, default: now() })
  createdAt: Date

  /**
   * Timestamp when the user was last updated (ISO-8601 string).
   */
  @Prop({ type: Date, default: now() })
  updatedAt: Date
}

/**
 * Mongoose model type for the User schema.
 */
export type UserModel = Model<User>

/**
 * Schema factory for the User class.
 */
export const UserSchema = SchemaFactory.createForClass(User)

/**
 * Password hash for users who registered locally.
 * Only applies when `provider === AuthProvider.LOCAL`.
 */
@Schema({ _id: false })
export class LocalUser {
  /**
   * Must be "LOCAL" for this subdocument.
   */
  provider!: AuthProvider.Local

  /**
   * The user’s hashed password for a local account.
   */
  @Prop({ type: String, required: true })
  hashedPassword: string
}

/**
 * Schema factory for the LocalUser class.
 */
export const LocalUserSchema = SchemaFactory.createForClass(LocalUser)
