import { Logger, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'

import { ProfileQuizController, QuizController } from './controllers'
import { QuizRepository } from './repositories'
import { Quiz, QuizSchema } from './repositories/models/schemas'
import { QuizService } from './services'

@Module({
  imports: [
    EventEmitterModule,
    MongooseModule.forFeature([
      {
        name: Quiz.name,
        schema: QuizSchema,
      },
    ]),
  ],
  controllers: [QuizController, ProfileQuizController],
  providers: [Logger, QuizService, QuizRepository],
  exports: [QuizService, QuizRepository],
})
export class QuizModule {}
