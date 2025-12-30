import { Logger, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'

import { GameCoreModule } from '../game-core'

import { GameEventPublisher, GameEventSubscriber } from './services'

/**
 * GameModule sets up the necessary controllers, providers, and Mongoose schemas
 * for handling game-related operations.
 */
@Module({
  imports: [EventEmitterModule, GameCoreModule],
  controllers: [],
  providers: [Logger, GameEventPublisher, GameEventSubscriber],
  exports: [GameEventPublisher, GameEventSubscriber],
})
export class GameEventModule {}
