import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { GameMode, QuestionType } from '@quiz/common'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'

import { Player, PlayerSchema } from './player.schema'
import {
  BaseQuestionSchema,
  QuestionMultiChoice,
  QuestionMultiChoiceSchema,
  QuestionRange,
  QuestionRangeSchema,
  QuestionTrueFalse,
  QuestionTrueFalseSchema,
  QuestionTypeAnswer,
  QuestionTypeAnswerSchema,
} from './question.schema'
import {
  BaseTask,
  LobbyTask,
  LobbyTaskSchema,
  QuestionTask,
  QuestionTaskSchema,
  TaskType,
} from './task.schema'

export type PartialGameModel = Pick<Game, 'name' | 'mode' | 'questions'>

export type GameDocument = HydratedDocument<Game>

@Schema({ collection: 'games' })
export class Game {
  @Prop({ type: String, required: true })
  _id: string

  @Prop({ type: String, required: true })
  name: string

  @Prop({ type: String, enum: GameMode, required: true })
  mode: GameMode

  @Prop({ type: String, required: true })
  pin: string

  @Prop({ type: [BaseQuestionSchema], required: true })
  questions: (
    | QuestionMultiChoice
    | QuestionRange
    | QuestionTrueFalse
    | QuestionTypeAnswer
  )[]

  @Prop({ type: Number, required: true })
  nextQuestion: number

  @Prop({ type: String, required: true })
  hostClientId: string

  @Prop({ type: [PlayerSchema], required: true })
  players: Player[]

  @Prop({ type: BaseTask, required: true })
  currentTask: BaseTask & (LobbyTask | QuestionTask)

  @Prop({ type: [BaseTask], required: true })
  previousTasks: (BaseTask & (LobbyTask | QuestionTask))[]

  @Prop({ type: Date, required: true })
  expires: Date

  @Prop({ type: Date, required: true })
  created: Date
}

export const GameSchema = SchemaFactory.createForClass(Game)
const questionsSchema = GameSchema.path<MongooseSchema.Types.Array>('questions')
questionsSchema.discriminator(
  QuestionType.MultiChoice,
  QuestionMultiChoiceSchema,
)
questionsSchema.discriminator(QuestionType.Range, QuestionRangeSchema)
questionsSchema.discriminator(QuestionType.TrueFalse, QuestionTrueFalseSchema)
questionsSchema.discriminator(QuestionType.TypeAnswer, QuestionTypeAnswerSchema)

const currentTaskSchema =
  GameSchema.path<MongooseSchema.Types.Subdocument>('currentTask')
currentTaskSchema.discriminator(TaskType.Lobby, LobbyTaskSchema)
currentTaskSchema.discriminator(TaskType.Question, QuestionTaskSchema)

const previousTasksSchema =
  GameSchema.path<MongooseSchema.Types.Array>('previousTasks')
previousTasksSchema.discriminator(TaskType.Lobby, LobbyTaskSchema)
previousTasksSchema.discriminator(TaskType.Question, QuestionTaskSchema)
