import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { LanguageCode, QuizVisibility } from '@quiz/common'
import { Model } from 'mongoose'

import { Player } from '../../../../player/services/models/schemas'

/**
 * Mongoose schema for the Quiz collection.
 */
@Schema({ collection: 'quizzes' })
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
   * Whether the quiz's visibility is public or private.
   */
  @Prop({ enum: QuizVisibility, required: true })
  visibility: QuizVisibility

  /**
   * The URL of the cover image for the quiz.
   */
  @Prop({ type: String, required: false })
  imageCoverURL?: string

  /**
   * The language code of the quiz.
   */
  @Prop({ enum: LanguageCode, required: true })
  languageCode: LanguageCode

  /**
   * The player document associated with the quiz.
   *
   * Stores a reference to a Player document to link quizzes with their owners profiles.
   */
  @Prop({ type: String, ref: 'Player' })
  owner: Player

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
