import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'

import { AuthModule } from '../auth'

import { GameController } from './controllers/game.controller'
import {
  GameEventPublisher,
  GameEventSubscriber,
  GameRepository,
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
    AuthModule,
  ],
  controllers: [GameController],
  providers: [
    GameEventPublisher,
    GameEventSubscriber,
    GameRepository,
    GameService,
  ],
})
export class GameModule {}
