import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import {
  MediaType,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@quiz/common'

/**
 * Mongoose schema for the Question Media.
 */
@Schema({ _id: false })
export class QuestionMediaDao {
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
 * Schema factory for the QuestionMediaDao class.
 */
export const QuestionMediaDaoSchema =
  SchemaFactory.createForClass(QuestionMediaDao)

/**
 * Mongoose schema for a general BaseQuestionDao document.
 *
 * This base schema includes common properties shared by all question types
 * and acts as a parent for discriminator-based subtypes.
 */
@Schema({ _id: false, discriminatorKey: 'type' })
export class BaseQuestionDao {
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
  @Prop({ type: QuestionMediaDao, required: false })
  media?: QuestionMediaDao

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
 * Schema factory for the BaseQuestionDao class.
 */
export const BaseQuestionDaoSchema =
  SchemaFactory.createForClass(BaseQuestionDao)

/**
 * Mongoose schema for the QuestionMultiChoiceDao Option.
 */
@Schema({ _id: false })
export class QuestionMultiChoiceOptionDao {
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
 * Schema factory for the QuestionMultiChoiceOptionDao class.
 */
export const QuestionMultiChoiceOptionDaoSchema = SchemaFactory.createForClass(
  QuestionMultiChoiceOptionDao,
)

/**
 * Mongoose schema for the multiple-choice question.
 */
@Schema()
export class QuestionMultiChoiceDao {
  /**
   * The type of the question, set to `MultiChoice`.
   */
  type!: QuestionType.MultiChoice

  /**
   * The list of options for the question.
   */
  @Prop({ type: [QuestionMultiChoiceOptionDao], required: true })
  options: QuestionMultiChoiceOptionDao[]
}

/**
 * Schema factory for the QuestionMultiChoiceDao class.
 */
export const QuestionMultiChoiceDaoSchema = SchemaFactory.createForClass(
  QuestionMultiChoiceDao,
)

/**
 * Mongoose schema for the range question.
 */
@Schema()
export class QuestionRangeDao {
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
 * Schema factory for the QuestionRangeDao class.
 */
export const QuestionRangeDaoSchema =
  SchemaFactory.createForClass(QuestionRangeDao)

/**
 * Mongoose schema for the true false question.
 */
@Schema()
export class QuestionTrueFalseDao {
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
 * Schema factory for the QuestionTrueFalseDao class.
 */
export const QuestionTrueFalseDaoSchema =
  SchemaFactory.createForClass(QuestionTrueFalseDao)

/**
 * Mongoose schema for the type answer question.
 */
@Schema()
export class QuestionTypeAnswerDao {
  /**
   * The type of the question, set to `TypeAnswer`.
   */
  type!: QuestionType.TypeAnswer

  /**
   * The list of acceptable answers for the question.
   */
  @Prop({ type: [String], required: true })
  options: string[]
}

/**
 * Schema factory for the QuestionTypeAnswerDao class.
 */
export const QuestionTypeAnswerDaoSchema = SchemaFactory.createForClass(
  QuestionTypeAnswerDao,
)

/**
 * Represents a question document with its specific discriminator type.
 *
 * Combines the base question schema (`BaseQuestion`) with the possible
 * discriminator types (`QuestionMultiChoiceDao`, `QuestionRangeDao`,
 * `QuestionTrueFalseDao`, and `QuestionTypeAnswerDao`) to define a complete
 * question model.
 */
export type QuestionDao = BaseQuestionDao &
  (
    | QuestionMultiChoiceDao
    | QuestionRangeDao
    | QuestionTrueFalseDao
    | QuestionTypeAnswerDao
  )
