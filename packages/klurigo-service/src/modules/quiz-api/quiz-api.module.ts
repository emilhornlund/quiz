import { Logger, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'

import { QuizCoreModule } from '../quiz-core'

import { ProfileQuizController, QuizController } from './controllers'
import { QuizRatingRepository } from './repositories'
import { QuizRating, QuizRatingSchema } from './repositories/models/schemas'
import { QuizRatingService, QuizService } from './services'

/**
 * NestJS module for quiz orchestration and API surface.
 *
 * Provides:
 * - Controllers for quiz and profile-scoped quiz operations.
 * - `QuizService` for quiz use-cases and orchestration (built on `QuizRepository` from `QuizCoreModule`).
 * - Quiz rating persistence and orchestration via `QuizRatingRepository` and `QuizRatingService`.
 *
 * Notes:
 * - Quiz persistence (schemas + repository) is owned by `QuizCoreModule`.
 */
@Module({
  imports: [
    EventEmitterModule,
    MongooseModule.forFeature([
      {
        name: QuizRating.name,
        schema: QuizRatingSchema,
      },
    ]),
    QuizCoreModule,
  ],
  controllers: [QuizController, ProfileQuizController],
  providers: [Logger, QuizRatingRepository, QuizRatingService, QuizService],
  exports: [QuizService],
})
export class QuizApiModule {}
