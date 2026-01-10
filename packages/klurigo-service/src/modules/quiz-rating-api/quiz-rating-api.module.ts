import { Logger, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'

import { GameCoreModule } from '../game-core'
import { QuizCoreModule } from '../quiz-core'

import { QuizRatingService } from './services'

/**
 * Module that provides the quiz rating API surface and related use-cases.
 */
@Module({
  imports: [EventEmitterModule, GameCoreModule, QuizCoreModule],
  providers: [Logger, QuizRatingService],
  exports: [],
})
export class QuizRatingApiModule {}
