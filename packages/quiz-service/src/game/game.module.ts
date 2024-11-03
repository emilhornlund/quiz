import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduleModule } from '@nestjs/schedule'

import { AuthModule } from '../auth'

import { GameController } from './controllers/game.controller'
import {
  GameEventPublisher,
  GameEventSubscriber,
  GameRepository,
  GameScheduler,
  GameService,
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
  ],
  controllers: [GameController],
  providers: [
    GameRepository,
    GameService,
    GameEventPublisher,
    GameEventSubscriber,
    GameScheduler,
  ],
})
export class GameModule {}
