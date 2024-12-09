import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import {
  MediaType,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@quiz/common'
import { Model } from 'mongoose'

/**
 * Mongoose schema for the Question Media.
 */
@Schema({ _id: false })
export class QuestionMedia {
  /**
   * The type of media (e.g., image, audio, video).
   */
  @Prop({
    type: String,
    required: true,
    enum: MediaType,
  })
  type: MediaType

  /**
   * The URL of the media.
   */
  @Prop({ type: String, required: true })
  url: string
}

/**
 * Schema factory for the QuestionMedia class.
 */
export const QuestionMediaSchema = SchemaFactory.createForClass(QuestionMedia)

/**
 * Mongoose schema for a general Question document.
 *
 * This base schema includes common properties shared by all question types
 * and acts as a parent for discriminator-based subtypes.
 */
@Schema({ _id: false, discriminatorKey: 'type' })
export class Question {
  /**
   * The type of the question.
   */
  @Prop({
    enum: QuestionType,
    required: true,
  })
  type!: QuestionType

  /**
   * The text of the question.
   */
  @Prop({ type: String, required: true })
  text: string

  /**
   * Optional media associated with the question (e.g., image or video).
   */
  @Prop({ type: QuestionMedia, required: false })
  media?: QuestionMedia

  /**
   * The number of points awarded for correctly answering the question.
   */
  @Prop({ type: Number, required: true })
  points: number

  /**
   * The duration in seconds allowed for answering the question.
   */
  @Prop({ type: Number, required: true })
  duration: number
}

/**
 * Mongoose model type for the Question schema.
 */
export type QuestionModel = Model<Question>

/**
 * Schema factory for the Question class.
 */
export const QuestionSchema = SchemaFactory.createForClass(Question)

/**
 * Mongoose schema for the Question Option.
 */
@Schema({ _id: false })
export class QuestionOption {
  /**
   * The value or text of the option.
   */
  @Prop({ type: String, required: true })
  value: string

  /**
   * Indicates whether the option is correct.
   */
  @Prop({ type: Boolean, required: true })
  correct: boolean
}

/**
 * Schema factory for the QuestionOption class.
 */
export const QuestionOptionSchema = SchemaFactory.createForClass(QuestionOption)

/**
 * Mongoose schema for the multiple-choice question.
 */
@Schema()
export class QuestionMultiChoice {
  /**
   * The type of the question, set to `MultiChoice`.
   */
  type!: QuestionType.MultiChoice

  /**
   * The list of options for the question.
   */
  @Prop({ type: [QuestionOption], required: true })
  options: QuestionOption[]
}

/**
 * Schema factory for the QuestionMultiChoice class.
 */
export const QuestionMultiChoiceSchema =
  SchemaFactory.createForClass(QuestionMultiChoice)

/**
 * Mongoose schema for the range question.
 */
@Schema()
export class QuestionRange {
  /**
   * The type of the question, set to `Range`.
   */
  type!: QuestionType.Range

  /**
   * The minimum value of the range.
   */
  @Prop({ type: Number, required: true })
  min: number

  /**
   * The maximum value of the range.
   */
  @Prop({ type: Number, required: true })
  max: number

  /**
   * The margin of error allowed for the answer.
   */
  @Prop({
    type: String,
    required: true,
    enum: QuestionRangeAnswerMargin,
  })
  margin: QuestionRangeAnswerMargin

  /**
   * The correct answer value.
   */
  @Prop({ type: Number, required: true })
  correct: number
}

/**
 * Schema factory for the QuestionRange class.
 */
export const QuestionRangeSchema = SchemaFactory.createForClass(QuestionRange)

/**
 * Mongoose schema for the true false question.
 */
@Schema()
export class QuestionTrueFalse {
  /**
   * The type of the question, set to `TrueFalse`.
   */
  type!: QuestionType.TrueFalse

  /**
   * The correct answer for the question (true or false).
   */
  @Prop({ type: Boolean, required: true })
  correct: boolean
}

/**
 * Schema factory for the QuestionTrueFalse class.
 */
export const QuestionTrueFalseSchema =
  SchemaFactory.createForClass(QuestionTrueFalse)

/**
 * Mongoose schema for the type answer question.
 */
@Schema()
export class QuestionTypeAnswer {
  /**
   * The type of the question, set to `TypeAnswer`.
   */
  type!: QuestionType.TypeAnswer

  /**
   * The list of acceptable answers for the question.
   */
  @Prop({ type: [QuestionOption], required: true })
  options: QuestionOption[]
}

/**
 * Schema factory for the QuestionTypeAnswer class.
 */
export const QuestionTypeAnswerSchema =
  SchemaFactory.createForClass(QuestionTypeAnswer)

/**
 * Represents a question document with its specific discriminator type.
 *
 * Combines the base question schema (`Question`) with the possible
 * discriminator types (`QuestionMultiChoice`, `QuestionRange`,
 * `QuestionTrueFalse`, and `QuestionTypeAnswer`) to define a complete
 * question model.
 */
export type QuestionWithDiscriminatorVariant = Question &
  (QuestionMultiChoice | QuestionRange | QuestionTrueFalse | QuestionTypeAnswer)
