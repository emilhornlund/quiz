import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { MurLock } from 'murlock'

import { GameRepository } from '../repositories'

/**
 * Periodically checks for completed or expired games and updates or removes them accordingly.
 *
 * - Marks eligible games as 'Completed' when they have reached the 'Podium' task and are stale.
 * - Deletes stale 'Active' games that have not been updated in over an hour.
 *
 * This helps keep the system clean by finalizing or removing abandoned game sessions.
 */
@Injectable()
export class GameExpirySchedulerService {
  private readonly logger = new Logger(GameExpirySchedulerService.name)

  /**
   * Initializes the scheduler service with access to the game repository.
   *
   * @param gameRepository - Repository for querying, updating, and deleting game documents.
   */
  constructor(private gameRepository: GameRepository) {}

  /**
   * Periodically runs cleanup logic every 5 minutes (when enabled).
   *
   * Ensures the following:
   * - Games in 'Podium' task with 'Active' status and no updates in over an hour are marked as 'Completed'.
   * - Games in 'Active' status that are not in 'Podium' or 'Quit' tasks and have not been updated in over an hour are marked as 'Expired'.
   *
   * Uses a MurLock to guarantee single-instance execution across a distributed environment.
   */
  @Cron('0 */5 * * * *')
  @MurLock(5000, 'scheduled_game_expiry_lock')
  public async clean() {
    const completed = await this.gameRepository.updateCompletedGames()
    this.logger.log(`Updated ${completed} completed games.`)

    const expired = await this.gameRepository.updateExpiredGames()
    this.logger.log(`Updated ${expired} expired games.`)
  }
}
