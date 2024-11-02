import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'

import { AuthModule } from '../auth'

import { GameController } from './controllers/game.controller'
import { GameEventService, GameService } from './services'
import { Game, GameSchema } from './services/models/schemas'

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
  providers: [GameService, GameEventService],
})
export class GameModule {}
