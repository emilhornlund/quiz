import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { QuestionType } from '@quiz/common'

import { QuizController } from './controllers'
import { QuizService } from './services'
import {
  Question,
  QuestionMedia,
  QuestionMediaSchema,
  QuestionMultiChoiceSchema,
  QuestionOption,
  QuestionOptionSchema,
  QuestionRangeSchema,
  QuestionSchema,
  QuestionTrueFalseSchema,
  QuestionTypeAnswerSchema,
  Quiz,
  QuizSchema,
} from './services/models/schemas'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Quiz.name,
        schema: QuizSchema,
      },
      {
        name: Question.name,
        schema: QuestionSchema,
        discriminators: [
          { name: QuestionType.MultiChoice, schema: QuestionMultiChoiceSchema },
          { name: QuestionType.Range, schema: QuestionRangeSchema },
          { name: QuestionType.TrueFalse, schema: QuestionTrueFalseSchema },
          { name: QuestionType.TypeAnswer, schema: QuestionTypeAnswerSchema },
        ],
      },
      {
        name: QuestionMedia.name,
        schema: QuestionMediaSchema,
      },
      {
        name: QuestionOption.name,
        schema: QuestionOptionSchema,
      },
    ]),
  ],
  controllers: [QuizController],
  providers: [Logger, QuizService],
  exports: [QuizService],
})
export class QuizModule {}
