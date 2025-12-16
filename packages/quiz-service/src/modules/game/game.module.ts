import { BullModule } from '@nestjs/bullmq'
import { Logger, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'

import { GameCoreModule } from '../game-core'
import { GameEventModule } from '../game-event/game-event.module'
import { GameResultModule } from '../game-result/game-result.module'
import { QuizModule } from '../quiz'
import { UserModule } from '../user'

import {
  GameController,
  ProfileGameController,
  QuizGameController,
} from './controllers'
import { GameListener } from './handlers'
import {
  GameExpirySchedulerService,
  GameService,
  GameTaskTransitionScheduler,
  GameTaskTransitionService,
  TASK_QUEUE_NAME,
} from './services'

/**
 * GameModule sets up the necessary controllers, providers, and Mongoose schemas
 * for handling game-related operations.
 */
@Module({
  imports: [
    BullModule.registerQueue({ name: TASK_QUEUE_NAME }),
    EventEmitterModule,
    GameCoreModule,
    GameEventModule,
    GameResultModule,
    QuizModule,
    UserModule,
  ],
  controllers: [GameController, QuizGameController, ProfileGameController],
  providers: [
    Logger,
    GameService,
    GameExpirySchedulerService,
    GameListener,
    GameTaskTransitionService,
    GameTaskTransitionScheduler,
  ],
  exports: [],
})
export class GameModule {}
