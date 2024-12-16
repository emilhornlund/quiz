import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { QuestionType } from '@quiz/common'

import { QuizController } from './controllers'
import { QuizService } from './services'
import {
  BaseQuestionDao,
  BaseQuestionDaoSchema,
  QuestionMediaDao,
  QuestionMediaDaoSchema,
  QuestionMultiChoiceDaoSchema,
  QuestionMultiChoiceOptionDao,
  QuestionMultiChoiceOptionDaoSchema,
  QuestionRangeDaoSchema,
  QuestionTrueFalseDaoSchema,
  QuestionTypeAnswerDaoSchema,
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
        name: BaseQuestionDao.name,
        schema: BaseQuestionDaoSchema,
        discriminators: [
          {
            name: QuestionType.MultiChoice,
            schema: QuestionMultiChoiceDaoSchema,
          },
          { name: QuestionType.Range, schema: QuestionRangeDaoSchema },
          { name: QuestionType.TrueFalse, schema: QuestionTrueFalseDaoSchema },
          {
            name: QuestionType.TypeAnswer,
            schema: QuestionTypeAnswerDaoSchema,
          },
        ],
      },
      {
        name: QuestionMediaDao.name,
        schema: QuestionMediaDaoSchema,
      },
      {
        name: QuestionMultiChoiceOptionDao.name,
        schema: QuestionMultiChoiceOptionDaoSchema,
      },
    ]),
  ],
  controllers: [QuizController],
  providers: [Logger, QuizService],
  exports: [QuizService],
})
export class QuizModule {}
