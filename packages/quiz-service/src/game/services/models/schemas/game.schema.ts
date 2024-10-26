import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { GameMode, QuestionType } from '@quiz/common'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

/* Base */
@Schema({ _id: false, discriminatorKey: 'type' })
export class BaseQuestion {
  @Prop({
    enum: [QuestionType.Multi, QuestionType.Slider],
    required: true,
  })
  type!: QuestionType.Multi | QuestionType.Slider

  @Prop({ type: String, required: true })
  question: string

  @Prop({ type: String, required: false })
  imageURL?: string

  @Prop({ type: Number, required: true })
  points: number

  @Prop({ type: Number, required: true })
  duration: number
}
export const BaseQuestionSchema = SchemaFactory.createForClass(BaseQuestion)

/* Multi Choice Option */
@Schema({ _id: false })
export class QuestionMultiChoiceOption {
  @Prop({ type: String, required: true })
  value: string

  @Prop({ type: Boolean, required: true })
  correct: boolean
}
export const QuestionMultiChoiceOptionSchema = SchemaFactory.createForClass(
  QuestionMultiChoiceOption,
)

/* Multi Choice */
@Schema({ _id: false })
export class QuestionMultiChoice {
  type!: QuestionType.Multi

  @Prop({ type: [QuestionMultiChoiceOptionSchema], required: true })
  options: QuestionMultiChoiceOption[]
}
export const QuestionMultiChoiceSchema =
  SchemaFactory.createForClass(QuestionMultiChoice)

/* Range */
@Schema({ _id: false })
export class QuestionRange {
  type!: QuestionType.Slider

  @Prop({ type: Number, required: true })
  min: number

  @Prop({ type: Number, required: true })
  max: number

  @Prop({ type: Number, required: true })
  correct: number
}
export const QuestionRangeSchema = SchemaFactory.createForClass(QuestionRange)

/* True False */
@Schema({ _id: false })
export class QuestionTrueFalse {
  type!: QuestionType.TrueFalse

  @Prop({ type: Boolean, required: true })
  correct: boolean
}
export const QuestionTrueFalseSchema =
  SchemaFactory.createForClass(QuestionTrueFalse)

/* True False */
@Schema({ _id: false })
export class QuestionTypeAnswer {
  type!: QuestionType.TypeAnswer

  @Prop({ type: String, required: true })
  correct: string
}
export const QuestionTypeAnswerSchema =
  SchemaFactory.createForClass(QuestionTypeAnswer)

/* Game */
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

  @Prop({ type: Date, default: () => new Date() })
  created: Date
}

export const GameSchema = SchemaFactory.createForClass(Game)
const gameSchema = GameSchema.path<MongooseSchema.Types.Array>('questions')
gameSchema.discriminator(QuestionType.Multi, QuestionMultiChoiceSchema)
gameSchema.discriminator(QuestionType.Slider, QuestionRangeSchema)
gameSchema.discriminator(QuestionType.TrueFalse, QuestionTrueFalseSchema)
gameSchema.discriminator(QuestionType.TypeAnswer, QuestionTypeAnswerSchema)
