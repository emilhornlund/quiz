import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'

import { GameRepository, GameResultRepository } from '../../game/repositories'
import { User, UserRepository } from '../../modules/user/repositories'
import { QuizRepository } from '../../quiz/repositories'

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
    @Inject(forwardRef(() => GameRepository))
    private readonly gameRepository: GameRepository,
    @Inject(forwardRef(() => GameResultRepository))
    private readonly gameResultRepository: GameResultRepository,
    private readonly quizRepository: QuizRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Migrate data from a legacy anonymous user into an existing account,
   * or update a legacy user’s details in place if no target account is given.
   *
   * @param migrationToken   The migration token identifying the legacy anonymous user.
   * @param existingUserId   (Optional) ID of the existing user to merge into.
   * @param updateDetails    (Optional) New details to set when updating in place.
   * @returns A Promise resolving to the User document after migration or update.
   */
  public async migrateLegacyPlayerUser<T extends User>(
    migrationToken: string,
    existingUserId?: string,
    updateDetails?: Partial<T>,
  ): Promise<T> {
    const legacyPlayerUser =
      await this.userRepository.removeMigrationTokenForUserOrThrow<T>(
        migrationToken,
      )

    // Simulate user creation, update details but skip data migration
    if (!existingUserId && updateDetails) {
      this.logger.log('Migrating legacy player')

      return this.userRepository.findUserByIdAndUpdateOrThrow<T>(
        legacyPlayerUser._id,
        updateDetails,
      )
    }

    // An already migrated user exists
    if (existingUserId && !updateDetails) {
      this.logger.log(`Migrating legacy player to '${existingUserId}'.`)

      const migratedUser =
        await this.userRepository.findUserByIdOrThrow<T>(existingUserId)

      try {
        await this.gameRepository.updateGameParticipant(
          legacyPlayerUser._id,
          existingUserId,
        )

        await this.gameResultRepository.updateGameResultParticipant(
          legacyPlayerUser._id,
          existingUserId,
        )

        await this.quizRepository.updateQuizOwner(
          legacyPlayerUser._id,
          existingUserId,
        )

        await this.userRepository.deleteUserById(legacyPlayerUser._id)
      } catch (error) {
        const { message, stack } = error as Error
        this.logger.warn(
          `Failed to migrate legacy player: '${message}'.`,
          stack,
        )
        throw new BadRequestException('Failed to migrate legacy player')
      }

      return migratedUser
    }

    this.logger.error(
      'Fatal error: Unable to migrate legacy player, should not reach here.',
    )
    throw new BadRequestException('Unable to migrate legacy player')
  }
}
