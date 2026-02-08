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
}

/**
 * Schema factory for the GameSettings class.
 */
export const GameSettingsSchema = SchemaFactory.createForClass(GameSettings)
