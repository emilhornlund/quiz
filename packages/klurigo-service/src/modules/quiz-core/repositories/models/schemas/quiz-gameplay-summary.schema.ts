import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

/**
 * Aggregated gameplay statistics for a quiz across all completed games.
 *
 * Maintained when a game is completed and its result is persisted, to avoid
 * expensive re-aggregation on read.
 *
 * Notes:
 * - Classic mode aggregates correct/incorrect/unanswered counts.
 * - ZeroToOneHundred mode aggregates attempted-only precision separately from unanswered,
 *   to prevent unanswered answers from skewing precision-based difficulty signals.
 */
@Schema({ _id: false })
export class QuizGameplaySummary {
  /**
   * Number of completed games played using this quiz.
   */
  @Prop({ type: Number, required: true, default: 0, min: 0 })
  count: number

  /**
   * Sum of player counts across all completed games for this quiz.
   */
  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalPlayerCount: number

  /**
   * Total number of correct Classic-mode answers, aggregated across all players
   * and all completed games.
   */
  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalClassicCorrectCount: number

  /**
   * Total number of incorrect Classic-mode answers, aggregated across all players
   * and all completed games.
   */
  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalClassicIncorrectCount: number

  /**
   * Total number of unanswered Classic-mode questions, aggregated across all players
   * and all completed games.
   */
  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalClassicUnansweredCount: number

  /**
   * Sum of ZeroToOneHundred precision contributions across attempted answers only,
   * aggregated across all players and all completed games.
   *
   * Precision is expected to be in the range 0..1, where 1 is best.
   */
  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalZeroToOneHundredPrecisionSum: number

  /**
   * Total number of attempted answers in ZeroToOneHundred mode, aggregated across
   * all players and all completed games.
   */
  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalZeroToOneHundredAnsweredCount: number

  /**
   * Total number of unanswered questions in ZeroToOneHundred mode, aggregated across
   * all players and all completed games.
   */
  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalZeroToOneHundredUnansweredCount: number

  /**
   * Timestamp for the most recently completed game using this quiz.
   */
  @Prop({ type: Date, required: false })
  lastPlayedAt?: Date

  /**
   * Timestamp of the last update to this summary.
   */
  @Prop({ type: Date, required: false })
  updated?: Date
}

/**
 * Schema factory for the QuizGameplaySummary class.
 */
export const QuizGameplaySummarySchema =
  SchemaFactory.createForClass(QuizGameplaySummary)
