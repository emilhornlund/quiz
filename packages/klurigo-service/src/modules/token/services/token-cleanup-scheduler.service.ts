import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { MurLock } from 'murlock'

import { TokenRepository } from '../repositories'

/**
 * Scheduled service for removing expired tokens from the database.
 */
@Injectable()
export class TokenCleanupSchedulerService {
  private readonly logger = new Logger(TokenCleanupSchedulerService.name)

  /**
   * Creates a new TokenCleanupSchedulerService.
   *
   * @param tokenRepository - Repository used to delete expired tokens.
   */
  constructor(private tokenRepository: TokenRepository) {}

  /**
   * Deletes all tokens that have expired.
   */
  @Cron('0 0 3 * * *')
  @MurLock(5000, 'scheduled_token_cleanup_lock')
  public async clean() {
    this.logger.log('Running scheduled token cleanup')

    const count = await this.tokenRepository.deleteMany({
      expiresAt: { $lt: new Date() },
    })

    this.logger.log(`Deleted ${count} expired tokens.`)
  }
}
