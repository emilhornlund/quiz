import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'

import { AuthModule } from '../auth'

import { GameController } from './controllers/game.controller'
import { GameEventService, GameService } from './services'
import { GameRepository } from './services/game.repository'
import { Game, GameSchema } from './services/models/schemas'

/**
 * GameModule sets up the dependencies for the Game feature, including controllers,
 * services, and Mongoose schemas.
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
  providers: [GameService, GameEventService, GameRepository],
})
export class GameModule {}
