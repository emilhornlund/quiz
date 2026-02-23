import {
  GameMode,
  LanguageCode,
  QuestionType,
  QuizCategory,
  QuizVisibility,
} from '@klurigo/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Model, Schema as MongooseSchema } from 'mongoose'

/**
 * Internal discovery metadata embedded on a Quiz document.
 *
 * These fields are intentionally excluded from public-facing DTOs
 * (e.g. QuizResponseDto) and are only used by the discovery compute pipeline.
 */
@Schema({ _id: false })
export class QuizDiscovery {
  /**
   * Optional ranking value that places this quiz in the FEATURED discovery
   * rail. Lower values indicate higher priority (e.g. 1 appears before 2).
   *
   * When set, the quiz is eligible for manual curation in the FEATURED rail.
   * Quizzes without this field fall back to quality-score ordering within
   * the FEATURED rail. Managed via an admin operation; not exposed in any
   * response DTO.
   */
  @Prop({ type: Number, required: false })
  featuredRank?: number
}

export const QuizDiscoverySchema = SchemaFactory.createForClass(QuizDiscovery)

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
import {
  QuizGameplaySummary,
  QuizGameplaySummarySchema,
} from './quiz-gameplay-summary.schema'
import {
  QuizRatingSummary,
  QuizRatingSummarySchema,
} from './quiz-rating-summary.schema'

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
   * Aggregated gameplay statistics for the quiz across completed games.
   */
  @Prop({
    type: QuizGameplaySummarySchema,
    required: true,
    default: () => ({
      count: 0,
      totalPlayerCount: 0,
      totalClassicCorrectCount: 0,
      totalClassicIncorrectCount: 0,
      totalClassicUnansweredCount: 0,
      totalZeroToOneHundredPrecisionSum: 0,
      totalZeroToOneHundredAnsweredCount: 0,
      totalZeroToOneHundredUnansweredCount: 0,
    }),
  })
  gameplaySummary: QuizGameplaySummary

  /**
   * Aggregated rating statistics for the quiz.
   *
   * Contains precomputed rating data such as average rating, total number
   * of ratings, and star distribution to support fast reads.
   */
  @Prop({
    type: QuizRatingSummarySchema,
    required: true,
    default: () => ({
      count: 0,
      avg: 0,
      stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
      commentCount: 0,
    }),
  })
  ratingSummary: QuizRatingSummary

  /**
   * Internal discovery metadata used by the discovery compute pipeline.
   *
   * This field is optional and is not exposed in any public response DTO.
   * See {@link QuizDiscovery} for field-level documentation.
   */
  @Prop({ type: QuizDiscoverySchema, required: false })
  discovery?: QuizDiscovery

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
