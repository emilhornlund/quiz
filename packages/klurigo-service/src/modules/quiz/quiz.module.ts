import { Logger, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'

import { ProfileQuizController, QuizController } from './controllers'
import { QuizRatingRepository, QuizRepository } from './repositories'
import {
  Quiz,
  QuizRating,
  QuizRatingSchema,
  QuizSchema,
} from './repositories/models/schemas'
import { QuizRatingService, QuizService } from './services'

/**
 * NestJS module for quiz functionality.
 *
 * Provides:
 * - Quiz persistence and orchestration.
 * - Quiz rating persistence and orchestration.
 * - Controllers for quiz and profile-scoped quiz operations.
 */
@Module({
  imports: [
    EventEmitterModule,
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
  controllers: [QuizController, ProfileQuizController],
  providers: [
    Logger,
    QuizRatingRepository,
    QuizRatingService,
    QuizRepository,
    QuizService,
  ],
  exports: [QuizRepository, QuizService],
})
export class QuizModule {}
