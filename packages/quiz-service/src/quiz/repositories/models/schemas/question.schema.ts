import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import {
  MediaType,
  QuestionImageRevealEffectType,
  QuestionPinTolerance,
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

  /**
   * Optional effect for the media (e.g., 'BLUR', 'SQUARE_3X3').
   */
  @Prop({
    type: String,
    required: false,
    enum: QuestionImageRevealEffectType,
    validate: {
      validator: function (
        this: QuestionMediaDao,
        v?: QuestionImageRevealEffectType,
      ) {
        // allow undefined
        if (v == null) return true
        // only allow when type === Image
        return this.type === MediaType.Image
      },
      message: '`effect` is only allowed when media `type` is Image',
    },
  })
  effect?: QuestionImageRevealEffectType
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
  @Prop({ type: QuestionMediaDaoSchema, required: false })
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

  /**
   * Optional info text shown with the question result/review
   * (explanation, fun fact, or source).
   */
  @Prop({ type: String, required: false })
  info?: string
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
@Schema({ _id: false })
export class QuestionMultiChoiceDao {
  /**
   * The type of the question, set to `MultiChoice`.
   */
  type!: QuestionType.MultiChoice

  /**
   * The list of options for the question.
   */
  @Prop({
    type: [QuestionMultiChoiceOptionDaoSchema],
    required: true,
  })
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
@Schema({ _id: false })
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
   * description here.
   */
  @Prop({ type: Number, required: true })
  step: number

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
@Schema({ _id: false })
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
@Schema({ _id: false })
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
 * Mongoose schema for the pin question.
 * Stores the correct point and tolerance on an image.
 */
@Schema({ _id: false })
export class QuestionPinDao {
  /**
   * The type of the question, set to `Pin`.
   */
  type!: QuestionType.Pin

  /**
   * Public URL of the background image on which the pin is placed.
   */
  @Prop({ type: String, required: true })
  imageURL: string

  /**
   * Correct X coordinate normalized to image width (0..1).
   */
  @Prop({ type: Number, required: true })
  positionX: number

  /**
   * Correct Y coordinate normalized to image height (0..1).
   */
  @Prop({ type: Number, required: true })
  positionY: number

  /**
   * Allowed distance preset around the correct point.
   */
  @Prop({
    type: String,
    required: true,
    enum: QuestionPinTolerance,
  })
  tolerance: QuestionPinTolerance
}

/**
 * Schema factory for the QuestionTypeAnswerDao class.
 */
export const QuestionPinDaoSchema = SchemaFactory.createForClass(QuestionPinDao)

/**
 * Mongoose schema for the puzzle question.
 * Holds the list of values that must be ordered by the player.
 */
@Schema({ _id: false })
export class QuestionPuzzleDao {
  /**
   * The type of the question, set to `Puzzle`.
   */
  type!: QuestionType.Puzzle

  /**
   * Values to be ordered into the correct sequence.
   */
  @Prop({ type: [String], required: true })
  values: string[]
}

/**
 * Schema factory for the QuestionTypeAnswerDao class.
 */
export const QuestionPuzzleDaoSchema =
  SchemaFactory.createForClass(QuestionPuzzleDao)

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
    | QuestionPinDao
    | QuestionPuzzleDao
  )
