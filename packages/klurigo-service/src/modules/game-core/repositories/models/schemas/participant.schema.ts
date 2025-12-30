import { GameParticipantType } from '@klurigo/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

/**
 * Represents a participant in a game, including host and player details.
 */
@Schema({ _id: false, discriminatorKey: 'type' })
export class ParticipantBase {
  /**
   * The unique identifier of the participant.
   */
  @Prop({ type: String, required: true })
  participantId: string

  /**
   * The type of participant, either host or player.
   */
  @Prop({
    type: String,
    enum: GameParticipantType,
    required: true,
  })
  type!: GameParticipantType

  /**
   * The date and time when the participant was created.
   */
  @Prop({ type: Date, required: true })
  created: Date

  /**
   * The date and time when the participant's record was last updated.
   */
  @Prop({ type: Date, required: true })
  updated: Date
}

/**
 * Schema factory for the Participant class.
 */
export const ParticipantSchema = SchemaFactory.createForClass(ParticipantBase)

/**
 * Represents the host of a game.
 */
@Schema({ _id: false })
export class ParticipantHost {
  /**
   * The type of participant, set to 'HOST' for this class.
   */
  type!: GameParticipantType.HOST
}

/**
 * Schema factory for the ParticipantHostSchema class.
 */
export const ParticipantHostSchema =
  SchemaFactory.createForClass(ParticipantHost)

/**
 * Represents a player in the game.
 */
@Schema({ _id: false })
export class ParticipantPlayer {
  /**
   * The type of participant, set to 'PLAYER' for this class.
   */
  type!: GameParticipantType.PLAYER

  /**
   * The nickname of the player.
   *
   * This is a user-provided or system-generated identifier for the player.
   */
  @Prop({ type: String, required: false })
  nickname: string

  /**
   * The player's current rank in the game (1 = first place, etc.).
   */
  @Prop({ type: Number, required: true })
  rank: number

  /**
   * The total score accumulated by the player during the game.
   */
  @Prop({ type: Number, required: true })
  totalScore: number

  /**
   * The current streak of correct answers for the player.
   */
  @Prop({ type: Number, required: true })
  currentStreak: number
}

/**
 * Schema factory for the ParticipantPlayer class.
 */
export const ParticipantPlayerSchema =
  SchemaFactory.createForClass(ParticipantPlayer)

/**
 * Convenience type for host participants.
 *
 * Combines the base participant fields with host-specific properties.
 */
export type ParticipantHostWithBase = ParticipantBase & ParticipantHost

/**
 * Convenience type for player participants.
 *
 * Combines the base participant fields with player-specific properties.
 */
export type ParticipantPlayerWithBase = ParticipantBase & ParticipantPlayer

/**
 * Represents a participant in a game.
 *
 * Discriminated union of host and player participants using the `type` field.
 */
export type Participant = ParticipantHostWithBase | ParticipantPlayerWithBase
