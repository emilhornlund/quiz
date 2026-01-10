import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { QuizRatingRepository, QuizRepository } from './repositories'
import {
  Quiz,
  QuizRating,
  QuizRatingSchema,
  QuizSchema,
} from './repositories/models/schemas'

/**
 * NestJS module for core quiz persistence concerns.
 *
 * Provides:
 * - Mongoose schema registration for `Quiz` and `QuizRating`.
 * - `QuizRepository` for querying and mutating quiz aggregates (including questions).
 * - `QuizRatingRepository` for storing and querying quiz ratings.
 *
 * Exports:
 * - `QuizRepository` for higher-level modules that orchestrate quiz workflows.
 * - `QuizRatingRepository` for modules that manage quiz ratings and summaries.
 *
 * Notes:
 * - API controllers and orchestration live in higher-level modules (e.g. `QuizApiModule`, `QuizRatingApiModule`).
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Quiz.name,
        schema: QuizSchema,
      },
      {
        name: QuizRating.name,
        schema: QuizRatingSchema,
      },
    ]),
  ],
  providers: [Logger, QuizRepository, QuizRatingRepository],
  exports: [QuizRepository, QuizRatingRepository],
})
export class QuizCoreModule {}
