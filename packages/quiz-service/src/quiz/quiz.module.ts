import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { QuizController } from './controllers'
import { QuizService } from './services'
import { Quiz, QuizSchema } from './services/models/schemas'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Quiz.name,
        schema: QuizSchema,
      },
    ]),
  ],
  controllers: [QuizController],
  providers: [Logger, QuizService],
})
export class QuizModule {}
