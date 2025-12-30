import {
  GameMode,
  LanguageCode,
  QuestionType,
  QuizCategory,
  QuizVisibility,
} from '@klurigo/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Model, Schema as MongooseSchema } from 'mongoose'

import { User } from '../../../../user/repositories'

import {
  BaseQuestionDao,
  BaseQuestionDaoSchema,
  QuestionMultiChoiceDao,
  QuestionMultiChoiceDaoSchema,
  QuestionPinDao,
  QuestionPinDaoSchema,
  QuestionPuzzleDao,
  QuestionPuzzleDaoSchema,
  QuestionRangeDao,
  QuestionRangeDaoSchema,
  QuestionTrueFalseDao,
  QuestionTrueFalseDaoSchema,
  QuestionTypeAnswerDao,
  QuestionTypeAnswerDaoSchema,
} from './question.schema'

/**
 * Mongoose schema for the Quiz collection.
 */
@Schema({ _id: true, collection: 'quizzes' })
export class Quiz {
  /**
   * The unique identifier of the quiz.
   * Acts as the primary key in the database.
   */
  @Prop({ type: String, required: true })
  _id: string

  /**
   * The title of the quiz.
   */
  @Prop({ type: String, required: true })
  title: string

  /**
   * A description of the quiz.
   */
  @Prop({ type: String, required: false })
  description?: string

  /**
   * The game mode of the quiz.
   */
  @Prop({ type: String, enum: GameMode, required: true })
  mode: GameMode

  /**
   * Whether the quiz's visibility is public or private.
   */
  @Prop({ type: String, enum: QuizVisibility, required: true })
  visibility: QuizVisibility

  /**
   * Specifies the category of the quiz.
   */
  @Prop({
    type: String,
    enum: QuizCategory,
    required: true,
    default: QuizCategory.Other,
  })
  category: QuizCategory

  /**
   * The URL of the cover image for the quiz.
   */
  @Prop({ type: String, required: false })
  imageCoverURL?: string

  /**
   * The language code of the quiz.
   */
  @Prop({ type: String, enum: LanguageCode, required: true })
  languageCode: LanguageCode

  /**
   * The associated questions of the quiz.
   */
  @Prop({ type: [BaseQuestionDaoSchema], required: true })
  questions: (BaseQuestionDao &
    (
      | QuestionMultiChoiceDao
      | QuestionRangeDao
      | QuestionTrueFalseDao
      | QuestionTypeAnswerDao
      | QuestionPinDao
      | QuestionPuzzleDao
    ))[]

  /**
   * The user document associated with the quiz.
   *
   * Stores a reference to a User document to link quizzes with their owners profiles.
   */
  @Prop({ type: String, ref: 'User' })
  owner: User

  /**
   * The date and time when the quiz was created.
   */
  @Prop({ type: Date, required: true })
  created: Date

  /**
   * The date and time when the quiz's record was last updated.
   */
  @Prop({ type: Date, required: true })
  updated: Date
}

/**
 * Mongoose model type for the Quiz schema.
 */
export type QuizModel = Model<Quiz>

/**
 * Schema factory for the Quiz class.
 */
export const QuizSchema = SchemaFactory.createForClass(Quiz)

/**
 * Setup question discriminators
 */
const questionsSchema = QuizSchema.path<MongooseSchema.Types.Array>('questions')
questionsSchema.discriminator(
  QuestionType.MultiChoice,
  QuestionMultiChoiceDaoSchema,
)
questionsSchema.discriminator(QuestionType.Range, QuestionRangeDaoSchema)
questionsSchema.discriminator(
  QuestionType.TrueFalse,
  QuestionTrueFalseDaoSchema,
)
questionsSchema.discriminator(
  QuestionType.TypeAnswer,
  QuestionTypeAnswerDaoSchema,
)
questionsSchema.discriminator(QuestionType.Pin, QuestionPinDaoSchema)
questionsSchema.discriminator(QuestionType.Puzzle, QuestionPuzzleDaoSchema)
