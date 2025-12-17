import { Logger, Module } from '@nestjs/common'

import { GameCoreModule } from '../game-core'

import { GameExpirySchedulerService } from './services'

/**
 * GameCleanupModule encapsulates scheduled maintenance and cleanup concerns
 * related to game lifecycle management.
 *
 * Responsibilities:
 * - Periodically finalize stale games that have reached a terminal state.
 * - Expire abandoned active games that are no longer progressing.
 *
 * This module is intentionally isolated from gameplay logic and controllers
 * and operates purely through scheduled background tasks.
 */
@Module({
  imports: [GameCoreModule],
  providers: [Logger, GameExpirySchedulerService],
  exports: [],
})
export class GameCleanupModule {}
