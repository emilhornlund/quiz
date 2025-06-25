import { Injectable, Logger } from '@nestjs/common'
import {
  AuthProvider,
  CreateUserRequestDto,
  CreateUserResponseDto,
  UpdateUserProfileRequestDto,
  UserProfileResponseDto,
} from '@quiz/common'
import * as bcrypt from 'bcryptjs'

import { BadCredentialsException } from '../exceptions'

import { LocalUser, User } from './models/schemas'
import { UserRepository } from './user.repository'
import { isLocalUser } from './utils'

/**
 * Service responsible for creating and retrieving user accounts.
 */
@Injectable()
export class UserService {
  // Logger instance for recording service operations.
  private readonly logger: Logger = new Logger(UserService.name)

  /**
   * Initializes the UserService.
   *
   * @param userRepository - Repository for user data access.
   */
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Verifies a local‐auth user's credentials.
   *
   * @param email - The email address of the user.
   * @param password - The plaintext password to verify.
   * @returns Promise resolving to the User & LocalUser data when valid.
   * @throws BadCredentialsException if email not found, provider mismatch, or password incorrect.
   */
  public async verifyUserCredentialsOrThrow(
    email: string,
    password: string,
  ): Promise<User & LocalUser> {
    const user = await this.userRepository.findUserByEmail(email)
    if (!user) {
      this.logger.debug(
        `Failed to successfully verify user credentials, email '${email}' not found.`,
      )
      throw new BadCredentialsException()
    }

    if (isLocalUser(user)) {
      const isPasswordCorrect = await bcrypt.compare(
        password,
        user.hashedPassword,
      )
      if (isPasswordCorrect) {
        return user
      }
    }

    this.logger.debug(
      `Unable to verify user credentials since provider is not '${AuthProvider.Local}'.`,
    )

    throw new BadCredentialsException()
  }

  /**
   * Creates and persists a new user record.
   *
   * @param requestDto Data for the new user (email, password, optional names).
   * @returns Created user data including timestamps.
   */
  public async createUser(
    requestDto: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    const { email, password, givenName, familyName, defaultNickname } =
      requestDto

    this.logger.debug(`Creating new user with email: '${email}'.`)

    await this.userRepository.verifyUniqueEmail(email)

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const details: Pick<
      CreateUserRequestDto,
      'email' | 'givenName' | 'familyName' | 'defaultNickname'
    > &
      Pick<LocalUser, 'hashedPassword'> = {
      email,
      hashedPassword,
      givenName,
      familyName,
      defaultNickname,
    }

    const createdUser = await this.userRepository.createLocalUser(details)

    this.logger.log(`Created a new user with email: '${email}'.`)

    return UserService.toCreateUserResponse(createdUser)
  }

  /**
   * Finds a profile user by their ID or throws an exception if not found.
   *
   * @param userId - The unique identifier of the user.
   *
   * @returns The profile user response dto.
   * @throws UserNotFoundException If the user is not found.
   */
  public async findUserProfileOrThrow(
    userId: string,
  ): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findUserByIdOrThrow(userId)
    return UserService.toProfileUserResponse(user)
  }

  /**
   * Updates the profile of an existing user.
   *
   * @param userId - The unique identifier of the user to update.
   * @param request -
   *
   * @returns A promise resolving to the updated user document.
   * @throws UserNotFoundException If no user exists with the specified ID.
   */
  public async updateUser(
    userId: string,
    request: UpdateUserProfileRequestDto,
  ): Promise<UserProfileResponseDto> {
    this.logger.debug(`Updating user '${userId}' with '${request}'.`)

    const updatedDetails: Partial<User> = {
      ...(request.email && { email: request.email }),
      ...(request.givenName && { givenName: request.givenName }),
      ...(request.familyName && { familyName: request.familyName }),
      ...(request.defaultNickname && {
        defaultNickname: request.defaultNickname,
      }),
      updatedAt: new Date(),
    }

    const updatedUser = await this.userRepository.findUserByIdAndUpdateOrThrow(
      userId,
      updatedDetails,
    )

    this.logger.debug(
      `Successfully updated user '${userId}' with '${request}'.`,
    )

    return UserService.toProfileUserResponse(updatedUser)
  }

  /**
   * Transforms a User document into a CreateUserResponseDto.
   *
   * @param createdUser - The User document returned from the database.
   * @returns DTO containing id, email, optional names, and timestamps.
   *
   * @private
   */
  private static toCreateUserResponse(
    createdUser: User,
  ): CreateUserResponseDto {
    const {
      _id,
      email,
      givenName,
      familyName,
      defaultNickname,
      createdAt,
      updatedAt,
    } = createdUser

    return {
      id: _id,
      email,
      givenName,
      familyName,
      defaultNickname,
      created: createdAt,
      updated: updatedAt,
    }
  }

  /**
   * Transforms a User document into a ProfileUserResponseDto.
   *
   * @param user - The User document returned from the database.
   * @returns DTO containing id, email, optional names, and timestamps.
   *
   * @private
   */
  private static toProfileUserResponse(user: User): UserProfileResponseDto {
    const {
      _id: id,
      email,
      givenName,
      familyName,
      defaultNickname,
      provider: authProvider,
      createdAt: created,
      updatedAt: updated,
    } = user

    return {
      id,
      email,
      givenName,
      familyName,
      defaultNickname,
      authProvider,
      created,
      updated,
    }
  }
}
