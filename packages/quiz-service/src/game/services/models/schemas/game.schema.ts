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
import { BaseTask, TaskLobby, TaskLobbySchema, TaskType } from './task.schema'

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

  @Prop({ type: Number, default: 0, required: true })
  nextQuestion: number

  @Prop({ type: String, default: uuidv4 })
  hostClientId: string

  @Prop({ type: [PlayerSchema], default: [] })
  players: Player[]

  @Prop({
    type: [BaseTask],
    default: [{ _id: uuidv4(), type: TaskType.Lobby, created: new Date() }],
  })
  tasks: TaskLobby[]

  @Prop({ type: Date, default: () => new Date() })
  created: Date
}

export const GameSchema = SchemaFactory.createForClass(Game)
const questionsSchema = GameSchema.path<MongooseSchema.Types.Array>('questions')
questionsSchema.discriminator(QuestionType.Multi, QuestionMultiChoiceSchema)
questionsSchema.discriminator(QuestionType.Slider, QuestionRangeSchema)
questionsSchema.discriminator(QuestionType.TrueFalse, QuestionTrueFalseSchema)
questionsSchema.discriminator(QuestionType.TypeAnswer, QuestionTypeAnswerSchema)

const tasksSchema = GameSchema.path<MongooseSchema.Types.Array>('tasks')
tasksSchema.discriminator(TaskType.Lobby, TaskLobbySchema)
