import { BullModule } from '@nestjs/bullmq'
import { Logger, Module } from '@nestjs/common'

import { GameCoreModule } from '../game-core'
import { GameEventModule } from '../game-event/game-event.module'
import { GameResultModule } from '../game-result/game-result.module'

import {
  GameTaskTransitionScheduler,
  GameTaskTransitionService,
  TASK_QUEUE_NAME,
} from './services'

/**
 * GameTaskModule provides task orchestration infrastructure for gameplay progression.
 *
 * This module wires:
 * - BullMQ queue registration for task transitions.
 * - Task transition services that move a game between Lobby, Question, Result, Leaderboard, Podium, and Quit tasks.
 * - Cross-module dependencies required to persist games, publish events, and create game results.
 */
@Module({
  imports: [
    BullModule.registerQueue({ name: TASK_QUEUE_NAME }),
    GameCoreModule,
    GameEventModule,
    GameResultModule,
  ],
  providers: [Logger, GameTaskTransitionService, GameTaskTransitionScheduler],
  exports: [GameTaskTransitionService, GameTaskTransitionScheduler],
})
export class GameTaskModule {}
