import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { GameMode, QuestionType } from '@quiz/common'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

import { BaseQuestionSchema } from './base-question.schema'
import { Player, PlayerSchema } from './player.schema'
import {
  QuestionMultiChoice,
  QuestionMultiChoiceSchema,
} from './question-multi-choice.schema'
import { QuestionRange, QuestionRangeSchema } from './question-range.schema'
import {
  QuestionTrueFalse,
  QuestionTrueFalseSchema,
} from './question-true-false.schema'
import {
  QuestionTypeAnswer,
  QuestionTypeAnswerSchema,
} from './question-type-answer.schema'

export type GameDocument = HydratedDocument<Game>

@Schema({ collection: 'games' })
export class Game {
  @Prop({ type: String, default: uuidv4 })
  _id: string

  @Prop({ type: String, required: true })
  name: string

  @Prop({ type: String, enum: GameMode, required: true })
  mode: GameMode

  @Prop({ type: String, required: true })
  pin: string

  @Prop({
    type: [BaseQuestionSchema],
    default: [],
  })
  questions: (
    | QuestionMultiChoice
    | QuestionRange
    | QuestionTrueFalse
    | QuestionTypeAnswer
  )[]

  @Prop({ type: String, default: uuidv4 })
  hostClientId: string

  @Prop({ type: [PlayerSchema], default: [] })
  players: Player[]

  @Prop({ type: Date, default: () => new Date() })
  created: Date
}

export const GameSchema = SchemaFactory.createForClass(Game)
const gameSchema = GameSchema.path<MongooseSchema.Types.Array>('questions')
gameSchema.discriminator(QuestionType.Multi, QuestionMultiChoiceSchema)
gameSchema.discriminator(QuestionType.Slider, QuestionRangeSchema)
gameSchema.discriminator(QuestionType.TrueFalse, QuestionTrueFalseSchema)
gameSchema.discriminator(QuestionType.TypeAnswer, QuestionTypeAnswerSchema)
