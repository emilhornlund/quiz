import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AuthProvider } from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import { BaseRepository } from '../../app/shared/repository'
import {
  EmailNotUniqueException,
  UserNotFoundByMigrationTokenException,
  UserNotFoundException,
} from '../exceptions'
import { isGoogleUser } from '../services/utils'

import { GoogleUser, LocalUser, User, UserModel } from './models'

/**
 * Repository for interacting with the User collection in the database.
 *
 * Extends BaseRepository to provide common CRUD operations and adds user-specific methods.
 */
@Injectable()
export class UserRepository extends BaseRepository<User> {
  /**
   * Constructs the UserRepository.
   *
   * @param userModel - The Mongoose model representing the User schema.
   */
  public constructor(
    @InjectModel(User.name) protected readonly userModel: UserModel,
  ) {
    super(userModel, 'User')
  }

  /**
   * Finds a user by their unique identifier.
   *
   * @param id - The unique identifier of the user.
   * @returns A Promise resolving to the User document of type T, or null if none exists.
   */
  public async findUserById<T extends User>(id: string): Promise<T | null> {
    const user = await this.findById(id)
    return user as T | null
  }

  /**
   * Finds a user by their unique identifier, or throws if not found.
   *
   * @param id - The unique identifier of the user.
   * @returns A Promise resolving to the User document of type T.
   * @throws UserNotFoundException if no user exists with the given id.
   */
  public async findUserByIdOrThrow<T extends User>(id: string): Promise<T> {
    const user = await this.findUserById<T>(id)
    if (!user) {
      throw new UserNotFoundException(id)
    }
    return user
  }

  /**
   * Finds a user document by email.
   *
   * @param email - The email address to search for.
   * @returns The matching User document, or null if none exists.
   */
  public async findUserByEmail(email: string): Promise<User | null> {
    return this.findOne({ email })
  }

  /**
   * Ensures the provided email is not already used by another user.
   *
   * @param email - The email address to verify.
   * @throws EmailNotUniqueException if a user with the given email already exists.
   */
  public async verifyUniqueEmail(email: string): Promise<void> {
    const foundUser = await this.findUserByEmail(email)

    if (foundUser) {
      this.logger.debug(`User email was not unique: "${email}".`)
      throw new EmailNotUniqueException(email)
    }
  }

  /**
   * Creates and persists a new user record.
   *
   * @param details - Object containing the user's details.
   * @returns The newly created User document.
   */
  public async createUser<T extends User>(details: Partial<T>): Promise<T> {
    const createdUser = await this.create(details)
    return createdUser as T
  }

  /**
   * Creates and persists a new local‐auth user record.
   *
   * @param details - Object containing email, hashedPassword, givenName and familyName.
   * @returns The newly created User document.
   */
  public async createLocalUser(
    details: Omit<
      LocalUser,
      '_id' | 'authProvider' | 'createdAt' | 'updatedAt'
    >,
  ): Promise<LocalUser> {
    return this.createUser<LocalUser>({
      ...details,
      _id: uuidv4(),
      authProvider: AuthProvider.Local,
    })
  }

  /**
   * Creates and persists a new google‐auth user record.
   *
   * @param details - Object containing google user information.
   * @returns The newly created User document.
   */
  public async createGoogleUser(
    details: Omit<
      GoogleUser,
      '_id' | 'authProvider' | 'createdAt' | 'updatedAt'
    >,
  ): Promise<GoogleUser> {
    return this.createUser<GoogleUser>({
      ...details,
      _id: uuidv4(),
      authProvider: AuthProvider.Google,
    })
  }

  /**
   * Updates a user document by its unique identifier, or throws if not found.
   *
   * @param id – The unique identifier of the user to update.
   * @param details - The details that will be updated.
   * @returns The updated user document.
   */
  public async findUserByIdAndUpdateOrThrow<T extends User>(
    id: string,
    details: Partial<T>,
  ): Promise<T> {
    // Check if user exists first
    const existingUser = await this.findById(id)
    if (!existingUser) {
      throw new UserNotFoundException(id)
    }

    if (
      details.authProvider &&
      details.authProvider !== existingUser.authProvider
    ) {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, details, {
          new: true,
          overwriteDiscriminatorKey: true,
          runValidators: true,
          context: 'query',
        })
        .exec()
      return updatedUser as T
    }

    const updatedUser = await this.update(id, details)
    if (!updatedUser) {
      throw new UserNotFoundException(id)
    }

    return updatedUser as T
  }

  /**
   * Finds a Google‐authenticated user by their Google user ID and updates their profile.
   *
   * @param googleUserId - The unique identifier assigned by Google to the user.
   * @param details - Partial profile fields to update (email, names, etc.).
   * @returns A promise resolving to the updated GoogleUser document, or `null` if not found.
   */
  public async findAndUpdateGoogleUserByGoogleId(
    googleUserId: string,
    details: Partial<
      Omit<GoogleUser, '_id' | 'authProvider' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<GoogleUser | null> {
    const user = await this.userModel.findOne({ googleUserId }).exec()

    if (!user || !isGoogleUser(user)) {
      return null
    }

    const updatedUser = await user.set(details).save()
    if (isGoogleUser(updatedUser)) {
      return updatedUser
    }

    return null
  }

  /**
   * Deletes a user by their unique identifier.
   *
   * @param userId  The unique identifier of the user to delete.
   * @returns A Promise that resolves once the user has been removed.
   */
  public async deleteUserById(userId: string): Promise<void> {
    await this.delete(userId)
  }

  /**
   * Removes a migration token from its owning user and returns the updated user.
   *
   * @param migrationToken - The migration token to remove.
   * @throws UserNotFoundByMigrationTokenException if no user contains that token.
   * @returns The updated User document with the token removed.
   */
  public async removeMigrationTokenForUserOrThrow<T extends User>(
    migrationToken: string,
  ): Promise<T> {
    const user = await this.userModel
      .findOne({ migrationTokens: { $eq: migrationToken } })
      .exec()

    if (!user) {
      throw new UserNotFoundByMigrationTokenException()
    }

    if (user.migrationTokens?.length > 0) {
      user.migrationTokens = user.migrationTokens.filter(
        (value) => value !== migrationToken,
      )
    } else {
      user.migrationTokens = undefined
    }

    const updatedUser = await user.save()
    return updatedUser as T
  }
}
