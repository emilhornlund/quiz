import { Logger, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'

import { QuizCoreModule } from '../quiz-core'

import { QuizRatingService } from './services'

/**
 * NestJS module for quiz rating orchestration and API-level concerns.
 *
 * Provides:
 * - `QuizRatingService` for quiz rating use-cases (create/update rating) and summary updates.
 *
 * Imports:
 * - `QuizCoreModule` for `QuizRatingRepository` and quiz persistence dependencies.
 * - `EventEmitterModule` for emitting rating-related events when ratings are created/updated.
 *
 * Notes:
 * - Rating persistence (`QuizRating` schema + repository) is owned by `QuizCoreModule`.
 * - The quiz API surface that is not rating-related is owned by `QuizApiModule`.
 */
@Module({
  imports: [EventEmitterModule, QuizCoreModule],
  providers: [Logger, QuizRatingService],
  exports: [],
})
export class QuizRatingApiModule {}
