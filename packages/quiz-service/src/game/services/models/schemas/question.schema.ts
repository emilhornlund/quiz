import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { QuestionType } from '@quiz/common'

/**
 * BaseQuestion
 */

@Schema({ _id: false, discriminatorKey: 'type' })
export class BaseQuestion {
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
  question: string

  @Prop({ type: String, required: false })
  imageURL?: string

  @Prop({ type: Number, required: true })
  points: number

  @Prop({ type: Number, required: true })
  duration: number
}

export const BaseQuestionSchema = SchemaFactory.createForClass(BaseQuestion)

/**
 * QuestionMultiChoiceOption
 */

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

/**
 * QuestionMultiChoice
 */

@Schema({ _id: false })
export class QuestionMultiChoice {
  type!: QuestionType.MultiChoice

  @Prop({ type: [QuestionMultiChoiceOptionSchema], required: true })
  options: QuestionMultiChoiceOption[]
}

export const QuestionMultiChoiceSchema =
  SchemaFactory.createForClass(QuestionMultiChoice)

/**
 * QuestionRange
 */

@Schema({ _id: false })
export class QuestionRange {
  type!: QuestionType.Range

  @Prop({ type: Number, required: true })
  min: number

  @Prop({ type: Number, required: true })
  max: number

  @Prop({ type: Number, required: true })
  step: number

  @Prop({ type: Number, required: true })
  correct: number
}

export const QuestionRangeSchema = SchemaFactory.createForClass(QuestionRange)

/**
 * QuestionTrueFalse
 */

@Schema({ _id: false })
export class QuestionTrueFalse {
  type!: QuestionType.TrueFalse

  @Prop({ type: Boolean, required: true })
  correct: boolean
}

export const QuestionTrueFalseSchema =
  SchemaFactory.createForClass(QuestionTrueFalse)

/**
 * QuestionTypeAnswer
 */

@Schema({ _id: false })
export class QuestionTypeAnswer {
  type!: QuestionType.TypeAnswer

  @Prop({ type: String, required: true })
  correct: string
}

export const QuestionTypeAnswerSchema =
  SchemaFactory.createForClass(QuestionTypeAnswer)
