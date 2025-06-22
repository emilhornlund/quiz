import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { v4 as uuidv4 } from 'uuid'

import { EmailNotUniqueException } from '../exceptions'

import { AuthProvider, User, UserModel } from './models/schemas'

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
  public async createLocalUser(details: {
    email: string
    hashedPassword: string
    givenName?: string
    familyName?: string
    defaultNickname?: string
  }): Promise<User> {
    return new this.userModel({
      _id: uuidv4(),
      provider: AuthProvider.Local,
      ...details,
    }).save()
  }
}
