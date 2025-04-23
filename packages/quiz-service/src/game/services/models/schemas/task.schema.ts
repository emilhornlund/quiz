import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { QuestionType } from '@quiz/common'
import { Schema as MongooseSchema } from 'mongoose'

export enum TaskType {
  Lobby = 'LOBBY',
  Question = 'QUESTION',
  QuestionResult = 'QUESTION_RESULT',
  Leaderboard = 'LEADERBOARD',
  Podium = 'PODIUM',
  Quit = 'QUIT',
}

/**
 * BaseTask
 */

@Schema({ _id: true, discriminatorKey: 'type' })
export class BaseTask {
  @Prop({ type: String, required: true })
  _id: string

  @Prop({
    type: String,
    enum: Object.keys(TaskType),
    required: true,
  })
  type!:
    | TaskType.Lobby
    | TaskType.Question
    | TaskType.QuestionResult
    | TaskType.Leaderboard
    | TaskType.Podium
    | TaskType.Quit

  @Prop({ type: String, default: 'pending' })
  status: 'pending' | 'active' | 'completed'

  @Prop({ type: Date, required: false })
  currentTransitionInitiated?: Date

  @Prop({ type: Date, required: false })
  currentTransitionExpires?: Date

  @Prop({ type: Date, default: () => new Date() })
  created: Date
}

export const BaseTaskSchema = SchemaFactory.createForClass(BaseTask)

/**
 * LobbyTask
 */

@Schema({ _id: false })
export class LobbyTask {
  type!: TaskType.Lobby
}

export const LobbyTaskSchema = SchemaFactory.createForClass(LobbyTask)

/**
 * QuestionTaskBaseAnswer
 */

@Schema({ _id: false, discriminatorKey: 'type' })
export class QuestionTaskBaseAnswer {
  @Prop({
    enum: [
      QuestionType.MultiChoice,
      QuestionType.Range,
      QuestionType.TrueFalse,
      QuestionType.TypeAnswer,
    ],
    required: true,
  })
  type!:
    | QuestionType.MultiChoice
    | QuestionType.Range
    | QuestionType.TrueFalse
    | QuestionType.TypeAnswer

  @Prop({ type: String, required: true })
  playerId: string

  @Prop({ type: Date, required: true })
  created: Date
}

export const QuestionTaskBaseAnswerSchema = SchemaFactory.createForClass(
  QuestionTaskBaseAnswer,
)

/**
 * QuestionTaskMultiChoiceAnswer
 */

@Schema({ _id: false })
export class QuestionTaskMultiChoiceAnswer {
  @Prop({ type: Number, required: true })
  answer: number
}

export const QuestionTaskMultiChoiceAnswerSchema = SchemaFactory.createForClass(
  QuestionTaskMultiChoiceAnswer,
)

/**
 * QuestionTaskRangeAnswer
 */

@Schema({ _id: false })
export class QuestionTaskRangeAnswer {
  @Prop({ type: Number, required: true })
  answer: number
}

export const QuestionTaskRangeAnswerSchema = SchemaFactory.createForClass(
  QuestionTaskRangeAnswer,
)

/**
 * QuestionTaskTrueFalseAnswer
 */

@Schema({ _id: false })
export class QuestionTaskTrueFalseAnswer {
  @Prop({ type: Boolean, required: true })
  answer: boolean
}

export const QuestionTaskTrueFalseAnswerSchema = SchemaFactory.createForClass(
  QuestionTaskTrueFalseAnswer,
)

/**
 * QuestionTaskTypeAnswerAnswer
 */

@Schema({ _id: false })
export class QuestionTaskTypeAnswerAnswer {
  @Prop({ type: String, required: true })
  answer: string
}

export const QuestionTaskTypeAnswerAnswerSchema = SchemaFactory.createForClass(
  QuestionTaskTypeAnswerAnswer,
)

/**
 * Represents a question task answer with its specific discriminator type.
 */
export type QuestionTaskAnswer = QuestionTaskBaseAnswer &
  (
    | QuestionTaskMultiChoiceAnswer
    | QuestionTaskRangeAnswer
    | QuestionTaskTrueFalseAnswer
    | QuestionTaskTypeAnswerAnswer
  )

/**
 * QuestionTask
 */

@Schema({ _id: false })
export class QuestionTask {
  type!: TaskType.Question

  @Prop({ type: Number, required: true })
  questionIndex: number

  @Prop({ type: [QuestionTaskBaseAnswerSchema], required: true })
  answers: (QuestionTaskBaseAnswer &
    (
      | QuestionTaskMultiChoiceAnswer
      | QuestionTaskRangeAnswer
      | QuestionTaskTrueFalseAnswer
      | QuestionTaskTypeAnswerAnswer
    ))[]

  @Prop({ type: Date, default: () => new Date() })
  presented?: Date
}

export const QuestionTaskSchema = SchemaFactory.createForClass(QuestionTask)

const questionTaskSchema =
  QuestionTaskSchema.path<MongooseSchema.Types.Array>('answers')
questionTaskSchema.discriminator(
  QuestionType.MultiChoice,
  QuestionTaskMultiChoiceAnswerSchema,
)
questionTaskSchema.discriminator(
  QuestionType.Range,
  QuestionTaskRangeAnswerSchema,
)
questionTaskSchema.discriminator(
  QuestionType.TrueFalse,
  QuestionTaskTrueFalseAnswerSchema,
)
questionTaskSchema.discriminator(
  QuestionType.TypeAnswer,
  QuestionTaskTypeAnswerAnswerSchema,
)

/**
 * QuestionResultTaskItem
 */

@Schema({ _id: false, discriminatorKey: 'type' })
export class QuestionResultTaskItem {
  @Prop({
    enum: [
      QuestionType.MultiChoice,
      QuestionType.Range,
      QuestionType.TrueFalse,
      QuestionType.TypeAnswer,
    ],
    required: true,
  })
  type!:
    | QuestionType.MultiChoice
    | QuestionType.Range
    | QuestionType.TrueFalse
    | QuestionType.TypeAnswer

  @Prop({ type: String, required: true })
  playerId: string

  @Prop({ type: QuestionTaskBaseAnswerSchema, required: false })
  answer?: QuestionTaskBaseAnswer &
    (
      | QuestionTaskMultiChoiceAnswer
      | QuestionTaskRangeAnswer
      | QuestionTaskTrueFalseAnswer
      | QuestionTaskTypeAnswerAnswer
    )

  @Prop({ type: Boolean, required: true })
  correct: boolean

  @Prop({ type: Number, required: true })
  lastScore: number

  @Prop({ type: Number, required: true })
  totalScore: number

  @Prop({ type: Number, required: true })
  position: number

  @Prop({ type: Number, required: true })
  streak: number
}

export const QuestionResultTaskItemSchema = SchemaFactory.createForClass(
  QuestionResultTaskItem,
)

const questionResultTaskItemSchema =
  QuestionResultTaskItemSchema.path<MongooseSchema.Types.Subdocument>('answer')
questionResultTaskItemSchema.discriminator(
  QuestionType.MultiChoice,
  QuestionTaskMultiChoiceAnswerSchema,
)
questionResultTaskItemSchema.discriminator(
  QuestionType.Range,
  QuestionTaskRangeAnswerSchema,
)
questionResultTaskItemSchema.discriminator(
  QuestionType.TrueFalse,
  QuestionTaskTrueFalseAnswerSchema,
)
questionResultTaskItemSchema.discriminator(
  QuestionType.TypeAnswer,
  QuestionTaskTypeAnswerAnswerSchema,
)

/**
 * QuestionResultTaskBaseCorrectAnswer
 */

@Schema({ _id: false, discriminatorKey: 'type' })
export class QuestionResultTaskBaseCorrectAnswer {
  @Prop({
    enum: [
      QuestionType.MultiChoice,
      QuestionType.Range,
      QuestionType.TrueFalse,
      QuestionType.TypeAnswer,
    ],
    required: true,
  })
  type!:
    | QuestionType.MultiChoice
    | QuestionType.Range
    | QuestionType.TrueFalse
    | QuestionType.TypeAnswer
}

export const QuestionResultTaskBaseCorrectAnswerSchema =
  SchemaFactory.createForClass(QuestionResultTaskBaseCorrectAnswer)

/**
 * QuestionResultTaskCorrectMultiChoiceAnswer
 */

@Schema({ _id: false })
export class QuestionResultTaskCorrectMultiChoiceAnswer {
  @Prop({ type: Number, required: true })
  index: number
}

export const QuestionResultTaskCorrectMultiChoiceAnswerSchema =
  SchemaFactory.createForClass(QuestionResultTaskCorrectMultiChoiceAnswer)

/**
 * QuestionResultTaskCorrectRangeAnswer
 */

@Schema({ _id: false })
export class QuestionResultTaskCorrectRangeAnswer {
  @Prop({ type: Number, required: true })
  value: number
}

export const QuestionResultTaskCorrectRangeAnswerSchema =
  SchemaFactory.createForClass(QuestionResultTaskCorrectRangeAnswer)

/**
 * QuestionResultTaskCorrectTrueFalseAnswer
 */

@Schema({ _id: false })
export class QuestionResultTaskCorrectTrueFalseAnswer {
  @Prop({ type: Boolean, required: true })
  value: boolean
}

export const QuestionResultTaskCorrectTrueFalseAnswerSchema =
  SchemaFactory.createForClass(QuestionResultTaskCorrectTrueFalseAnswer)

/**
 * QuestionResultTaskCorrectTypeAnswer
 */

@Schema({ _id: false })
export class QuestionResultTaskCorrectTypeAnswer {
  @Prop({ type: String, required: true })
  value: string
}

export const QuestionResultTaskCorrectTypeAnswerSchema =
  SchemaFactory.createForClass(QuestionResultTaskCorrectTypeAnswer)

/**
 * Represents a question result task correct answer with its specific discriminator type.
 */
export type QuestionResultTaskCorrectAnswer =
  QuestionResultTaskBaseCorrectAnswer &
    (
      | QuestionResultTaskCorrectMultiChoiceAnswer
      | QuestionResultTaskCorrectRangeAnswer
      | QuestionResultTaskCorrectTrueFalseAnswer
      | QuestionResultTaskCorrectTypeAnswer
    )

/**
 * QuestionResultTask
 */

@Schema({ _id: false })
export class QuestionResultTask {
  type!: TaskType.QuestionResult

  @Prop({ type: Number, required: true })
  questionIndex: number

  @Prop({
    type: [QuestionResultTaskBaseCorrectAnswerSchema],
    required: true,
  })
  correctAnswers: QuestionResultTaskCorrectAnswer[]

  @Prop({ type: [QuestionResultTaskItemSchema], required: true })
  results: QuestionResultTaskItem[]
}

export const QuestionResultTaskSchema =
  SchemaFactory.createForClass(QuestionResultTask)

const questionResultTaskSchema =
  QuestionResultTaskSchema.path<MongooseSchema.Types.Array>('correctAnswers')
questionResultTaskSchema.discriminator(
  QuestionType.MultiChoice,
  QuestionResultTaskCorrectMultiChoiceAnswerSchema,
)
questionResultTaskSchema.discriminator(
  QuestionType.Range,
  QuestionResultTaskCorrectRangeAnswerSchema,
)
questionResultTaskSchema.discriminator(
  QuestionType.TrueFalse,
  QuestionResultTaskCorrectTrueFalseAnswerSchema,
)
questionResultTaskSchema.discriminator(
  QuestionType.TypeAnswer,
  QuestionResultTaskCorrectTypeAnswerSchema,
)

/**
 * LeaderboardTaskItem
 */

@Schema({ _id: false })
export class LeaderboardTaskItem {
  @Prop({ type: String, required: true })
  playerId: string

  @Prop({ type: Number, required: true })
  position: number

  @Prop({ type: String, required: true })
  nickname: string

  @Prop({ type: Number, required: true })
  score: number

  @Prop({ type: Number, required: true })
  streaks: number
}

export const LeaderboardTaskItemSchema =
  SchemaFactory.createForClass(LeaderboardTaskItem)

/**
 * LeaderboardTask
 */

@Schema({ _id: false })
export class LeaderboardTask {
  type!: TaskType.Leaderboard

  @Prop({ type: Number, required: true })
  questionIndex: number

  @Prop({ type: [LeaderboardTaskItemSchema], required: true })
  leaderboard: LeaderboardTaskItem[]
}

export const LeaderboardTaskSchema =
  SchemaFactory.createForClass(LeaderboardTask)

/**
 * PodiumTask
 */

@Schema({ _id: false })
export class PodiumTask {
  type!: TaskType.Podium

  @Prop({ type: [LeaderboardTaskItemSchema], required: true })
  leaderboard: LeaderboardTaskItem[]
}

export const PodiumTaskSchema = SchemaFactory.createForClass(PodiumTask)

/**
 * QuitTask
 */

@Schema({ _id: false })
export class QuitTask {
  type!: TaskType.Quit
}

export const QuitTaskSchema = SchemaFactory.createForClass(QuitTask)
