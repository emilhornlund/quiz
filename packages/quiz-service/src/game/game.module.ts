import { Logger, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduleModule } from '@nestjs/schedule'

import { AuthModule } from '../auth'
import { ClientModule } from '../client'
import { PlayerModule } from '../player'
import { QuizModule } from '../quiz'

import { GameController, QuizGameController } from './controllers'
import {
  GameEventPublisher,
  GameEventSubscriber,
  GameRepository,
  GameService,
  GameTaskTransitionScheduler,
} from './services'
import { Game, GameSchema } from './services/models/schemas'

/**
 * GameModule sets up the necessary controllers, providers, and Mongoose schemas
 * for handling game-related operations.
 */
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: Game.name,
        schema: GameSchema,
      },
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
    PlayerModule,
    ClientModule,
    QuizModule,
  ],
  controllers: [GameController, QuizGameController],
  providers: [
    Logger,
    GameRepository,
    GameService,
    GameEventPublisher,
    GameEventSubscriber,
    GameTaskTransitionScheduler,
  ],
})
export class GameModule {}
