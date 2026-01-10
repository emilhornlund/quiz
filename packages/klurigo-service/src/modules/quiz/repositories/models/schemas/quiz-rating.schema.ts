import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { User } from '../../../../user/repositories'

/**
 * Mongoose schema for quiz ratings and feedback comments.
 *
 * Each document represents a single user's rating for a specific quiz.
 * A unique compound index on `(quizId, author)` ensures a user can only submit one rating per quiz.
 */
@Schema({ _id: true, collection: 'quiz_ratings' })
export class QuizRating {
  /**
   * The unique identifier of the rating document.
   * Acts as the primary key in the database.
   */
  @Prop({ type: String, required: true })
  _id: string

  /**
   * The quiz being rated.
   *
   * Stores a reference to a Quiz document and is used for efficient lookups
   * when retrieving ratings and feedback for a specific quiz.
   */
  @Prop({ type: String, ref: 'Quiz', required: true, index: true })
  quizId: string

  /**
   * The user who left the rating.
   *
   * Stores a reference to a User document and is used to enforce one rating per user per quiz.
   */
  @Prop({ type: String, ref: 'User', required: true, index: true })
  author: User

  /**
   * Star rating for the quiz.
   *
   * Must be an integer value between 1 and 5 (inclusive).
   */
  @Prop({ type: Number, required: true, min: 1, max: 5 })
  stars: number

  /**
   * Optional free-text feedback comment for the quiz.
   *
   * Intended to capture qualitative feedback from the user.
   */
  @Prop({ type: String, required: false, maxlength: 2000 })
  comment?: string

  /**
   * The date and time when the rating was created.
   */
  @Prop({ type: Date, required: true })
  created: Date

  /**
   * The date and time when the rating was last updated.
   *
   * Updated whenever the user edits their rating or feedback comment.
   */
  @Prop({ type: Date, required: true })
  updated: Date
}

/**
 * Mongoose model type for the QuizRating schema.
 */
export type QuizRatingModel = Model<QuizRating>

/**
 * Schema factory for the QuizRating class.
 */
export const QuizRatingSchema = SchemaFactory.createForClass(QuizRating)

/**
 * Ensures a user can only submit one rating per quiz.
 */
QuizRatingSchema.index({ quizId: 1, author: 1 }, { unique: true })

/**
 * Supports efficient retrieval of the latest ratings and feedback for a quiz.
 */
QuizRatingSchema.index({ quizId: 1, created: -1 })

/**
 * Supports efficient retrieval of a user's rating history.
 */
QuizRatingSchema.index({ author: 1, created: -1 })
