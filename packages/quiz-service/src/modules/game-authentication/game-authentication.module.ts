import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'

import { GameModule } from '../game'
import { TokenModule } from '../token'

import { GameAuthenticationController } from './controllers'
import { GameAuthenticationService } from './services'

/**
 * Module responsible for game-specific authentication.
 *
 * Provides endpoints and services for authenticating participants
 * (hosts or players) into active games using game identifiers or PINs.
 */
@Module({
  imports: [GameModule, TokenModule, EventEmitterModule, HttpModule],
  controllers: [GameAuthenticationController],
  providers: [GameAuthenticationService],
  exports: [GameAuthenticationService],
})
export class GameAuthenticationModule {}
