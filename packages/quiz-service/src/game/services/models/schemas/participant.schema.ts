import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { GameParticipantType } from '@quiz/common'

import { Player } from '../../../../player/services/models/schemas'

/**
 * Represents a participant in a game, including host and player details.
 */
@Schema({ _id: false, discriminatorKey: 'type' })
export class ParticipantBase {
  /**
   * The type of participant, either host or player.
   */
  @Prop({
    enum: GameParticipantType,
    required: true,
  })
  type!: GameParticipantType

  /**
   * The player document associated with the participant.
   *
   * Stores a reference to a Player document to link games with their player profiles.
   */
  @Prop({ type: String, ref: 'Player' })
  player: Player

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
 *
 */
export type Participant = ParticipantBase &
  (ParticipantHost | ParticipantPlayer)
