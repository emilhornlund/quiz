import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AuthProvider } from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import { EmailNotUniqueException, UserNotFoundException } from '../exceptions'
import { isGoogleUser } from '../services/utils'

import { GoogleUser, LocalUser, User, UserModel } from './models'

/**
 * Repository for interacting with the User collection in the database.
 */
@Injectable()
export class UserRepository {
  // Logger instance for recording repository operations.
  private readonly logger: Logger = new Logger(UserRepository.name)

  /**
   * Constructs the UserRepository.
   *
   * @param userModel - The Mongoose model representing the User schema.
   */
  public constructor(
    @InjectModel(User.name) private readonly userModel: UserModel,
  ) {}

  /**
   * Retrieves a user document by its unique identifier.
   *
   * @param id – The unique identifier to search for.
   * @returns The matching User document, or `null` if none exists.
   */
  public async findUserById(id: string): Promise<User> {
    return this.userModel.findById(id).exec()
  }

  /**
   * Retrieves a user document by its unique identifier, or throws if not found.
   *
   * @param id – The unique identifier to search for.
   * @returns The matching User document.
   * @throws UserNotFoundException if no user exists with the given `id`.
   */
  public async findUserByIdOrThrow(id: string): Promise<User> {
    const user = await this.findUserById(id)
    if (!user) {
      this.logger.warn(`User was not found by id '${id}.`)
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
  public async findUserByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec()
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
  ): Promise<User> {
    return new this.userModel({
      ...details,
      _id: uuidv4(),
      authProvider: AuthProvider.Local,
    }).save()
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
  ): Promise<GoogleUser | null> {
    const createdUser: User = await new this.userModel({
      ...details,
      _id: uuidv4(),
      authProvider: AuthProvider.Google,
    }).save()

    if (isGoogleUser(createdUser)) {
      return createdUser
    }
  }

  /**
   * Updates a user document by its unique identifier, or throws if not found.
   *
   * @param id – The unique identifier of the user to update.
   * @param details - The details that will be updated.
   * @returns The updated user document.
   */
  public async findUserByIdAndUpdateOrThrow(
    id: string,
    details: Partial<User>,
  ): Promise<User> {
    const user = await this.userModel.findById(id).exec()

    if (!user) {
      this.logger.warn(`User was not found by id '${id}.`)
      throw new UserNotFoundException(id)
    }

    return user.set(details).save()
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
}
