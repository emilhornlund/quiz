import { Logger, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduleModule } from '@nestjs/schedule'
import { GameParticipantType } from '@quiz/common'

import { AuthModule } from '../auth'
import { PlayerModule } from '../player'

import { GameController } from './controllers/game.controller'
import {
  GameEventPublisher,
  GameEventSubscriber,
  GameRepository,
  GameService,
  GameTaskTransitionScheduler,
} from './services'
import {
  Game,
  GameSchema,
  ParticipantHostSchema,
  ParticipantPlayerSchema,
} from './services/models/schemas'

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
        discriminators: [
          { name: GameParticipantType.HOST, schema: ParticipantHostSchema },
          { name: GameParticipantType.PLAYER, schema: ParticipantPlayerSchema },
        ],
      },
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
    PlayerModule,
  ],
  controllers: [GameController],
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
