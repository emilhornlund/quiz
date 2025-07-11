import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AuthProvider } from '@quiz/common'
import { Model, now } from 'mongoose'

import { SkipValidation } from '../../../../app/decorators'

interface IUser {
  /**
   * The user’s unique identifier.
   */

  _id: string

  /**
   * The user’s authentication provider.
   */
  authProvider: AuthProvider

  /**
   * The user’s unique email address.
   */
  email: string

  /**
   * The user’s given name (optional).
   */
  givenName?: string

  /**
   * The user’s family name (optional).
   */
  familyName?: string

  /**
   * The user’s default nickname used for when participating in games (optional).
   */
  defaultNickname?: string

  /**
   * Date and time of the user's last successful login.
   */
  lastLoggedInAt?: Date

  /**
   * Timestamp when the user was created (ISO-8601 string).
   */
  createdAt: Date

  /**
   * Timestamp when the user was last updated (ISO-8601 string).
   */
  updatedAt: Date
}

/**
 * Mongoose schema for the User collection.
 */
@SkipValidation()
@Schema({
  _id: true,
  collection: 'users',
  discriminatorKey: 'authProvider',
  timestamps: true,
})
export class User implements IUser {
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
    enum: [AuthProvider.Local],
    required: true,
  })
  authProvider: AuthProvider

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
   * Date and time of the user's last successful login.
   */
  @Prop({ type: Date, required: false })
  lastLoggedInAt?: Date

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
export class LocalUser implements IUser {
  /**
   * The user’s unique identifier.
   */
  _id: string

  /**
   * The user’s authentication provider, Local in for this discriminator.
   */
  authProvider!: AuthProvider.Local

  /**
   * The user’s unique email address.
   */
  email: string

  /**
   * The user’s hashed password for a local account.
   */
  @Prop({ type: String, required: true })
  hashedPassword: string

  /**
   * The user’s given name (optional).
   */
  givenName?: string

  /**
   * The user’s family name (optional).
   */
  familyName?: string

  /**
   * The user’s default nickname used for when participating in games (optional).
   */
  defaultNickname?: string

  /**
   * Date and time of the user's last successful login.
   */
  lastLoggedInAt?: Date

  /**
   * Timestamp when the user was created (ISO-8601 string).
   */
  createdAt: Date

  /**
   * Timestamp when the user was last updated (ISO-8601 string).
   */
  updatedAt: Date
}

/**
 * Schema factory for the LocalUser class.
 */
export const LocalUserSchema = SchemaFactory.createForClass(LocalUser)
