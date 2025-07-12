import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  AuthProvider,
  CreateUserRequestDto,
  CreateUserResponseDto,
  UpdateUserProfileRequestDto,
  UserProfileResponseDto,
} from '@quiz/common'
import * as bcrypt from 'bcryptjs'

import { EnvironmentVariables } from '../../app/config'
import { AuthService } from '../../auth/services'
import { EmailService } from '../../email/services'
import { BadCredentialsException } from '../exceptions'
import { LocalUser, User, UserRepository } from '../repositories'

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
   * @param userRepository – Repository for user data access.
   * @param authService    – Service for authentication operations (e.g., token generation, verification).
   * @param emailService   – Service for sending emails (welcome, verification, etc.).
   * @param configService  – Service for reading application configuration and environment variables.
   */
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  /**
   * Verifies a local‐auth user's credentials.
   *
   * @param email - The email address of the user.
   * @param password - The plaintext password to verify.
   * @returns Promise resolving to the LocalUser data when valid.
   * @throws BadCredentialsException if email not found, provider mismatch, or password incorrect.
   */
  public async verifyUserCredentialsOrThrow(
    email: string,
    password: string,
  ): Promise<LocalUser> {
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
      Pick<LocalUser, 'unverifiedEmail' | 'hashedPassword'> = {
      email,
      unverifiedEmail: email,
      hashedPassword,
      givenName,
      familyName,
      defaultNickname,
    }

    const createdUser = await this.userRepository.createLocalUser(details)

    this.logger.log(`Created a new user with email: '${email}'.`)

    try {
      const verificationLink = await this.generateVerifyEmailLink(
        createdUser._id,
        email,
      )
      await this.emailService.sendWelcomeEmail(email, verificationLink)
    } catch (error) {
      const { message, stack } = error as Error
      this.logger.error(`Failed to send welcome email: '${message}'.`, stack)
    }

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

    const originalUser = await this.userRepository.findUserByIdOrThrow(userId)

    const updatedDetails: Partial<User> = {
      ...this.computeEmailUpdate(request.email, originalUser),
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

    await this.sendVerificationEmail(updatedUser)

    return UserService.toProfileUserResponse(updatedUser)
  }

  /**
   * Confirm that the provided email matches the user’s unverifiedEmail,
   * then clear the unverifiedEmail field to mark verification.
   *
   * Logs each step and throws if the email doesn’t match
   * or if the account isn’t a local user.
   *
   * @param userId - The unique identifier of the user being verified.
   * @param email - The email address extracted from the verification token.
   * @returns A promise that resolves when the email has been successfully verified.
   * @throws BadRequestException if the email does not match unverifiedEmail.
   * @throws ForbiddenException if the user account isn’t a local user.
   */
  public async verifyEmail(userId: string, email: string): Promise<void> {
    this.logger.log(`Verifying email '${email}' for user '${userId}'.`)

    const user = await this.userRepository.findUserByIdOrThrow(userId)
    if (isLocalUser(user)) {
      if (user.unverifiedEmail === email) {
        await this.userRepository.findUserByIdAndUpdateOrThrow(userId, {
          unverifiedEmail: undefined,
        } as LocalUser)
      } else {
        this.logger.debug(
          `Email '${email}' does not match unverified email '${user.unverifiedEmail}' for user '${userId}'.`,
        )
        throw new BadRequestException('Email does not match')
      }
    } else {
      this.logger.debug(`User '${userId}' is not a local account.`)
      throw new ForbiddenException('Incorrect user type')
    }
  }

  /**
   * Initiates resending of the verification email for a given user.
   *
   * Logs the action and then looks up the user by ID before sending.
   *
   * @param userId - The unique identifier of the user to resend verification for.
   * @returns void after the send operation has been attempted.
   */
  public async resendVerificationEmail(userId: string): Promise<void> {
    this.logger.log(`Resending verification email for user '${userId}'.`)

    const user = await this.userRepository.findUserByIdOrThrow(userId)
    return this.sendVerificationEmail(user)
  }

  /**
   * Sends a verification email if the user’s unverified email differs from their primary email.
   *
   * - Verifies the user is a local account with both `email` and `unverifiedEmail` set.
   * - Generates a time-limited verification link.
   * - Dispatches the email via the EmailService.
   * - Logs successes and failures appropriately.
   *
   * @param user - The User entity containing email details and identifier.
   * @returns void once the email has been sent or deemed unnecessary.
   */
  private async sendVerificationEmail(user: User): Promise<void> {
    if (
      isLocalUser(user) &&
      user.email &&
      user.unverifiedEmail &&
      user.email !== user.unverifiedEmail
    ) {
      try {
        const verificationLink = await this.generateVerifyEmailLink(
          user._id,
          user.unverifiedEmail,
        )

        this.logger.log(`Sending verification email for user '${user._id}'.`)

        await this.emailService.sendVerificationEmail(
          user.unverifiedEmail,
          verificationLink,
        )
      } catch (error) {
        const { message, stack } = error as Error
        this.logger.error(
          `Failed to send verification email: '${message}'.`,
          stack,
        )
      }
    } else {
      this.logger.debug(
        `User '${user._id}' not qualified for email verification.`,
      )
    }
  }

  /**
   * Change a local user’s password after verifying their current credentials.
   *
   * Verifies that `oldPassword` matches the existing hash, then hashes
   * `newPassword` and updates the user record.
   *
   * @param userId - The unique identifier of the user whose password will be changed.
   * @param oldPassword - The user’s current password for verification.
   * @param newPassword - The new password to set; must meet complexity rules.
   * @returns A promise that resolves when the password has been successfully updated.
   * @throws BadRequestException if the provided old password does not match the stored password.
   * @throws ForbiddenException if the user is not a local account.
   */
  public async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    this.logger.debug(`Changing password for user '${userId}'.`)

    const user = await this.userRepository.findUserByIdOrThrow(userId)

    if (isLocalUser(user)) {
      const isPasswordCorrect = await bcrypt.compare(
        oldPassword,
        user.hashedPassword,
      )

      if (isPasswordCorrect) {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        await this.userRepository.findUserByIdAndUpdateOrThrow(userId, {
          hashedPassword,
        } as LocalUser)

        this.logger.log(`Updated password for user '${userId}'.`)
      } else {
        this.logger.debug(`Old password is incorrect for user '${userId}'.`)
        throw new BadRequestException('Old password is incorrect')
      }
    } else {
      this.logger.debug(`User '${userId}' is not a local account.`)
      throw new ForbiddenException('Incorrect user type')
    }
  }

  /**
   * Computes how to patch a User’s email fields based on a requested change.
   *
   * - If `newEmail` is falsy, returns an empty object (no change).
   * - If the new email differs from the current one _and_ the user is a local user,
   *   sets only `unverifiedEmail` so we can send a verification.
   * - Otherwise, updates the verified `email` and clears any pending `unverifiedEmail`.
   *
   * @param newEmail      – The email provided in the update request (may be undefined).
   * @param originalUser  – The existing User record from the database.
   * @returns A partial User object containing exactly the email‐related fields to be updated.
   */
  private computeEmailUpdate(
    newEmail: string | undefined,
    originalUser: User,
  ): Partial<User | LocalUser> {
    if (!newEmail) {
      return {}
    }

    if (isLocalUser(originalUser)) {
      if (newEmail !== originalUser.email) {
        return { unverifiedEmail: newEmail }
      }
      return {
        email: newEmail,
        unverifiedEmail: undefined,
      }
    }

    return {
      email: newEmail,
    }
  }

  /**
   * Generates a verification link for a user’s new email address.
   *
   * This method creates a signed token for the given user and email,
   * then constructs the full URL that the user will visit to confirm
   * their new address.
   *
   * @param userId          - The unique identifier of the user requesting verification.
   * @param unverifiedEmail - The new email address that requires confirmation.
   * @returns A promise that resolves to the complete verification URL containing a signed token.
   * @private
   */
  private async generateVerifyEmailLink(
    userId: string,
    unverifiedEmail: string,
  ): Promise<string> {
    this.logger.debug(
      `Generating verification link for user '${userId}' and unverified email '${unverifiedEmail}'.`,
    )
    const verificationToken = await this.authService.signVerifyEmailToken(
      userId,
      unverifiedEmail,
    )
    return `${this.configService.get('KLURIGO_URL')}/auth/verify?token=${verificationToken}`
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

    const unverifiedEmail = isLocalUser(createdUser)
      ? createdUser.unverifiedEmail
      : undefined

    return {
      id: _id,
      email,
      unverifiedEmail,
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
      authProvider,
      createdAt: created,
      updatedAt: updated,
    } = user

    const unverifiedEmail = isLocalUser(user) ? user.unverifiedEmail : undefined

    return {
      id,
      email,
      unverifiedEmail,
      givenName,
      familyName,
      defaultNickname,
      authProvider,
      created,
      updated,
    }
  }
}
