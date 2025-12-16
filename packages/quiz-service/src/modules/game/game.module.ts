import { BullModule } from '@nestjs/bullmq'
import { Logger, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'

import { GameResultModule } from '../game-result/game-result.module'
import { QuizModule } from '../quiz'
import { UserModule } from '../user'

import {
  GameController,
  ProfileGameController,
  QuizGameController,
} from './controllers'
import { GameListener } from './handlers'
import { GameEventOrchestrator } from './orchestration/event'
import { GameTaskOrchestrator } from './orchestration/task'
import { GameRepository } from './repositories'
import { Game, GameSchema } from './repositories/models/schemas'
import {
  GameEventPublisher,
  GameEventSubscriber,
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
    EventEmitterModule,
    BullModule.registerQueue({ name: TASK_QUEUE_NAME }),
    MongooseModule.forFeature([
      {
        name: Game.name,
        schema: GameSchema,
      },
    ]),
    UserModule,
    QuizModule,
    GameResultModule,
  ],
  controllers: [GameController, QuizGameController, ProfileGameController],
  providers: [
    Logger,
    GameRepository,
    GameService,
    GameEventPublisher,
    GameEventSubscriber,
    GameExpirySchedulerService,
    GameListener,
    GameTaskTransitionService,
    GameTaskTransitionScheduler,
    GameEventOrchestrator,
    GameTaskOrchestrator,
  ],
  exports: [GameRepository],
})
export class GameModule {}
