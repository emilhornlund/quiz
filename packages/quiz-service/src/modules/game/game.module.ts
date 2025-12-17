import { Logger, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'

import { GameCoreModule } from '../game-core'
import { GameEventModule } from '../game-event/game-event.module'
import { GameResultModule } from '../game-result/game-result.module'
import { GameTaskModule } from '../game-task'
import { QuizModule } from '../quiz'
import { UserModule } from '../user'

import {
  GameController,
  ProfileGameController,
  QuizGameController,
} from './controllers'
import { GameListener } from './handlers'
import { GameExpirySchedulerService, GameService } from './services'

/**
 * GameModule sets up the necessary controllers, providers, and Mongoose schemas
 * for handling game-related operations.
 */
@Module({
  imports: [
    EventEmitterModule,
    GameCoreModule,
    GameEventModule,
    GameResultModule,
    GameTaskModule,
    QuizModule,
    UserModule,
  ],
  controllers: [GameController, QuizGameController, ProfileGameController],
  providers: [Logger, GameService, GameExpirySchedulerService, GameListener],
  exports: [],
})
export class GameModule {}
