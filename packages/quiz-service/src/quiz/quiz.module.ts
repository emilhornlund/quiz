import { forwardRef, Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { GameModule } from '../game'

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
    forwardRef(() => GameModule),
  ],
  controllers: [QuizController],
  providers: [Logger, QuizService],
  exports: [QuizService],
})
export class QuizModule {}
