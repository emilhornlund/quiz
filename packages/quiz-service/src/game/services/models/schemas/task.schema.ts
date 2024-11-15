import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { QuestionType } from '@quiz/common'
import { Schema as MongooseSchema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export enum TaskType {
  Lobby = 'LOBBY',
  Question = 'QUESTION',
}

/**
 * BaseTask
 */

@Schema({ _id: true, discriminatorKey: 'type' })
export class BaseTask {
  @Prop({ type: String, default: uuidv4 })
  _id: string

  @Prop({
    type: String,
    enum: Object.keys(TaskType),
    required: true,
  })
  type!: TaskType.Lobby | TaskType.Question

  @Prop({ type: String, default: 'pending' })
  status: 'pending' | 'active' | 'completed'

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

@Schema({ _id: true, discriminatorKey: 'type' })
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
 * QuestionTask
 */

@Schema({ _id: false })
export class QuestionTask {
  type!: TaskType.Question

  @Prop({ type: Number, required: true })
  questionIndex: number

  @Prop({ type: [QuestionTaskBaseAnswer], required: true })
  answers: (QuestionTaskBaseAnswer &
    (
      | QuestionTaskMultiChoiceAnswer
      | QuestionTaskRangeAnswer
      | QuestionTaskTrueFalseAnswer
      | QuestionTaskTypeAnswerAnswer
    ))[]
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
