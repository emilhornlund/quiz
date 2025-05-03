import { Logger, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'

import { ClientQuizController, QuizController } from './controllers'
import { QuizService } from './services'
import { Quiz, QuizSchema } from './services/models/schemas'

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
  controllers: [QuizController, ClientQuizController],
  providers: [Logger, QuizService],
  exports: [QuizService],
})
export class QuizModule {}
