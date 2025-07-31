import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common'
import { AuthProvider } from '@quiz/common'

import { GameRepository, GameResultRepository } from '../../game/repositories'
import { QuizRepository } from '../../quiz/repositories'
import { User, UserRepository } from '../../user/repositories'

/**
 * Service for migrating data from legacy (anonymous) users into real accounts,
 * or updating legacy-only user details in place.
 */
@Injectable()
export class MigrationService {
  // Logger instance for recording migration service operations.
  private readonly logger: Logger = new Logger(MigrationService.name)

  /**
   * Initializes the MigrationService.
   *
   * @param gameRepository        Repository for game document operations.
   * @param gameResultRepository  Repository for game-result document operations.
   * @param quizRepository        Repository for quiz document operations.
   * @param userRepository        Repository for user document operations.
   */
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly gameResultRepository: GameResultRepository,
    private readonly quizRepository: QuizRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Migrate data from a legacy anonymous user into an existing account,
   * or update a legacy user’s details in place if no target account is given.
   *
   * @param legacyPlayerId   ID of the anonymous/legacy user.
   * @param existingUserId   (Optional) ID of the existing user to merge into.
   * @param updateDetails    (Optional) New details to set when updating in place.
   * @returns A Promise resolving to the User document after migration or update.
   */
  public async migrateLegacyPlayerUser<T extends User>(
    legacyPlayerId: string,
    existingUserId?: string,
    updateDetails?: Partial<T>,
  ): Promise<T> {
    const legacyPlayerUser =
      await this.userRepository.findUserById(legacyPlayerId)

    const isLegacyPlayerValid =
      legacyPlayerUser && legacyPlayerUser.authProvider === AuthProvider.None

    const isLegacyPlayerMigrated =
      legacyPlayerUser && legacyPlayerUser.authProvider !== AuthProvider.None

    // Simulate user creation, update details but skip data migration
    if (!existingUserId && updateDetails && isLegacyPlayerValid) {
      this.logger.log(`Migrating legacy player '${legacyPlayerId}'.`)

      return this.userRepository.findUserByIdAndUpdateOrThrow<T>(
        legacyPlayerId,
        updateDetails,
      )
    }
    // Create an actual new user in case of the legacy player does not exist
    else if (!existingUserId && updateDetails && !legacyPlayerUser) {
      this.logger.log(`Create new user from legacy player '${legacyPlayerId}'.`)
      return this.userRepository.createUser<T>({
        _id: legacyPlayerId,
        ...updateDetails,
      })
    }
    // An already migrated user exists
    else if (existingUserId && !updateDetails) {
      this.logger.log(
        `Migrating legacy player '${legacyPlayerId}' to '${existingUserId}'.`,
      )

      const migratedUser =
        await this.userRepository.findUserByIdOrThrow<T>(existingUserId)

      // Associate the legacy player with the already migrated user
      if (isLegacyPlayerValid) {
        try {
          await this.gameRepository.updateGameParticipant(
            legacyPlayerId,
            existingUserId,
          )

          await this.gameResultRepository.updateGameResultParticipant(
            legacyPlayerId,
            existingUserId,
          )

          await this.quizRepository.updateQuizOwner(
            legacyPlayerId,
            existingUserId,
          )

          await this.userRepository.deleteUserById(legacyPlayerId)
        } catch (error) {
          const { message, stack } = error as Error
          this.logger.warn(
            `Failed to migrate legacy player '${legacyPlayerId}': '${message}'.`,
            stack,
          )
          throw new BadRequestException(
            `Failed to migrate legacy player '${legacyPlayerId}'`,
          )
        }
      }

      return migratedUser
    }
    // Legacy player already migrated
    else if (isLegacyPlayerMigrated) {
      this.logger.log(
        `Unable to migrate legacy player '${legacyPlayerId}', already migrated.`,
      )
      throw new ConflictException(
        `Unable to migrate legacy player '${legacyPlayerId}', already migrated`,
      )
    }

    this.logger.error(
      `Fatal error: Unable to migrate legacy player '${legacyPlayerId}', should not reach here.`,
    )
    throw new BadRequestException(
      `Unable to migrate legacy player '${legacyPlayerId}'`,
    )
  }
}
