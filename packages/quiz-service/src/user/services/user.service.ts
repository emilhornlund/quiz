import { Injectable, Logger } from '@nestjs/common'
import { CreateUserRequestDto, CreateUserResponseDto } from '@quiz/common'
import * as bcrypt from 'bcryptjs'

import { User } from './models/schemas'
import { UserRepository } from './user.repository'

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
   * Creates and persists a new user record.
   *
   * @param requestDto Data for the new user (email, password, optional names).
   * @returns Created user data including timestamps.
   */
  public async createUser(
    requestDto: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    const { email, password, givenName, familyName } = requestDto

    this.logger.debug(`Creating new user with email: "${email}".`)

    await this.userRepository.verifyUniqueEmail(email)

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const createdUser = await this.userRepository.createLocalUser({
      email,
      hashedPassword,
      givenName,
      familyName,
    })

    this.logger.log(`Created a new user with email: "${email}".`)

    return UserService.toCreateUserResponse(createdUser)
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
    const { _id, email, givenName, familyName, createdAt, updatedAt } =
      createdUser

    return {
      id: _id,
      email,
      givenName,
      familyName,
      created: createdAt,
      updated: updatedAt,
    }
  }
}
