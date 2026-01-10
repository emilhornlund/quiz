import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { QuizRepository } from './repositories'
import { Quiz, QuizSchema } from './repositories/models/schemas'

/**
 * NestJS module for core quiz persistence concerns.
 *
 * Provides:
 * - Mongoose schema registration for `Quiz`.
 * - `QuizRepository` for querying and mutating quiz aggregates (including questions).
 *
 * Exports:
 * - `QuizRepository` for use by higher-level modules (e.g. `QuizModule`) that orchestrate quiz workflows.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Quiz.name,
        schema: QuizSchema,
      },
    ]),
  ],
  providers: [Logger, QuizRepository],
  exports: [QuizRepository],
})
export class QuizCoreModule {}
