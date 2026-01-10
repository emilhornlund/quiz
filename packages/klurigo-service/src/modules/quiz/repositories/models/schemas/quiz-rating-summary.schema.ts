import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

/**
 * Embedded schema representing aggregated rating statistics for a quiz.
 *
 * This document is stored directly on the Quiz document to allow fast reads
 * without requiring aggregation over individual rating documents.
 */
@Schema({ _id: false })
export class QuizRatingSummary {
  /**
   * The total number of ratings submitted for the quiz.
   */
  @Prop({ type: Number, required: true, default: 0 })
  count: number

  /**
   * The average star rating for the quiz.
   *
   * Represents the mean value of all submitted star ratings.
   */
  @Prop({ type: Number, required: true, default: 0 })
  avg: number

  /**
   * Distribution of ratings per star value.
   *
   * Each key represents a star value (1–5) and its corresponding count.
   */
  @Prop({
    type: Object,
    required: true,
    default: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
  })
  stars: Record<'1' | '2' | '3' | '4' | '5', number>

  /**
   * The date and time when the rating summary was last updated.
   *
   * Updated whenever an individual rating affecting the summary changes.
   */
  @Prop({ type: Date, required: false })
  updated?: Date
}

/**
 * Schema factory for the QuizRatingSummary class.
 */
export const QuizRatingSummarySchema =
  SchemaFactory.createForClass(QuizRatingSummary)
