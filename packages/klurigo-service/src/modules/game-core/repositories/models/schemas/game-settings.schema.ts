import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

/**
 * Mongoose subdocument that controls runtime behavior of a game instance.
 *
 * The settings are persisted on the game document and can be toggled to
 * influence how the task scheduler transitions between post-question tasks.
 */
@Schema({ _id: false })
export class GameSettings {
  /**
   * When enabled, the QuestionResult task is allowed to auto-complete even when
   * its configured transition delay is 0.
   *
   * This is mainly used for games without player participants (e.g. host-only
   * flows) where waiting for client-driven transitions is unnecessary.
   */
  @Prop({ type: Boolean, required: true, default: false })
  shouldAutoCompleteQuestionResultTask: boolean

  /**
   * When enabled, the Leaderboard task is allowed to auto-complete even when
   * its configured transition delay is 0.
   *
   * This is mainly used for games without player participants (e.g. host-only
   * flows) where waiting for client-driven transitions is unnecessary.
   */
  @Prop({ type: Boolean, required: true, default: false })
  shouldAutoCompleteLeaderboardTask: boolean

  /**
   * When enabled, the Podium task is allowed to auto-complete even when
   * its configured transition delay is 0.
   *
   * This is mainly used for games without player participants (e.g. host-only
   * flows) where waiting for client-driven transitions is unnecessary.
   */
  @Prop({ type: Boolean, required: true, default: false })
  shouldAutoCompletePodiumTask: boolean

  /**
   * Whether to randomize the order of questions when the game starts.
   *
   * When enabled, questions are shuffled before the first round begins so participants
   * see the quiz in a different sequence. The shuffle is applied per game instance and
   * does not modify the underlying quiz definition.
   */
  @Prop({ type: Boolean, required: true, default: false })
  randomizeQuestionOrder: boolean

  /**
   * Whether to randomize the order of answer options for each question.
   *
   * When enabled, the answer alternatives for each question are shuffled before being
   * presented to participants. This is applied per question per game instance and does
   * not modify the underlying quiz definition.
   */
  @Prop({ type: Boolean, required: true, default: false })
  randomizeAnswerOrder: boolean
}

/**
 * Schema factory for the GameSettings class.
 */
export const GameSettingsSchema = SchemaFactory.createForClass(GameSettings)
