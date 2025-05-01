import { BullModule } from '@nestjs/bullmq'
import { Logger, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'

import { AuthModule } from '../auth'
import { ClientModule } from '../client'
import { PlayerModule } from '../player'
import { QuizModule } from '../quiz'

import {
  ClientGameController,
  GameController,
  QuizGameController,
} from './controllers'
import { GameResultController } from './controllers/game-result.controller'
import { GameListener } from './handlers'
import {
  GameEventPublisher,
  GameEventSubscriber,
  GameExpirySchedulerService,
  GameRepository,
  GameResultRepository,
  GameResultService,
  GameService,
  GameTaskTransitionScheduler,
  GameTaskTransitionService,
  TASK_QUEUE_NAME,
} from './services'
import { Game, GameSchema } from './services/models/schemas'
import { GameResult, GameResultSchema } from './services/models/schemas'

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
      {
        name: GameResult.name,
        schema: GameResultSchema,
      },
    ]),
    AuthModule,
    PlayerModule,
    ClientModule,
    QuizModule,
  ],
  controllers: [
    GameController,
    GameResultController,
    QuizGameController,
    ClientGameController,
  ],
  providers: [
    Logger,
    GameRepository,
    GameService,
    GameEventPublisher,
    GameEventSubscriber,
    GameExpirySchedulerService,
    GameListener,
    GameResultRepository,
    GameResultService,
    GameTaskTransitionService,
    GameTaskTransitionScheduler,
  ],
})
export class GameModule {}
