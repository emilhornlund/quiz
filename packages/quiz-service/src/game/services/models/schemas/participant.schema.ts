import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { GameParticipantType } from '@quiz/common'

import { Client } from '../../../../client/services/models/schemas'

/**
 * Represents a participant in a game, including host and player details.
 */
@Schema({ id: false, discriminatorKey: 'type' })
export class Participant {
  /**
   * The type of participant, either host or player.
   */
  @Prop({
    enum: GameParticipantType,
    required: true,
  })
  type!: GameParticipantType

  /**
   * The client object associated with the participant, referencing the player or host.
   */
  @Prop({ type: String, ref: 'Client' })
  client: Client

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
export const ParticipantSchema = SchemaFactory.createForClass(Participant)

/**
 * Represents the host of a game.
 */
@Schema()
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
@Schema()
export class ParticipantPlayer {
  /**
   * The type of participant, set to 'PLAYER' for this class.
   */
  type!: GameParticipantType.PLAYER

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
