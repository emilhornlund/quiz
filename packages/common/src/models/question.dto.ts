import { MediaType } from './media-type.enum'
import { QuestionRangeAnswerMargin } from './question-range-answer-margin.enum'
import { QuestionType } from './question-type.enum'

/**
 * Represents media associated with a question, such as an image or video.
 */
export interface QuestionMediaDto {
  /**
   * The type of media (e.g., image, audio, video).
   */
  type: MediaType

  /**
   * The URL of the media.
   */
  url: string
}

/**
 * Common properties shared across all question types.
 */
export interface QuestionCommonDto {
  /**
   * The text of the question.
   */
  question: string

  /**
   * Optional media associated with the question (e.g., image or video).
   */
  media?: QuestionMediaDto

  /**
   * The number of points awarded for correctly answering the question.
   */
  points: number

  /**
   * The duration in seconds allowed for answering the question.
   */
  duration: number
}

/**
 * Represents an option for multiple-choice or type-answer questions.
 */
export interface QuestionMultiChoiceOptionDto {
  /**
   * The value or text of the option.
   */
  value: string

  /**
   * Indicates whether the option is correct.
   */
  correct: boolean
}

/**
 * Represents a multiple-choice question.
 */
export interface QuestionMultiChoiceDto extends QuestionCommonDto {
  /**
   * The type of the question, set to `MultiChoice`.
   */
  type: QuestionType.MultiChoice

  /**
   * The list of options for the question.
   */
  options: QuestionMultiChoiceOptionDto[]
}

/**
 * Represents a range-based question where the answer lies within a range.
 */
export interface QuestionRangeDto extends QuestionCommonDto {
  /**
   * The type of the question, set to `Range`.
   */
  type: QuestionType.Range

  /**
   * The minimum value of the range.
   */
  min: number

  /**
   * The maximum value of the range.
   */
  max: number

  /**
   * The margin of error allowed for the answer.
   */
  margin: QuestionRangeAnswerMargin

  /**
   * The correct answer value.
   */
  correct: number
}

/**
 * Represents a range-based question where the answer lies within 0 to 100.
 */
export type QuestionZeroToOneHundredRangeDto = Omit<
  QuestionRangeDto,
  'min' | 'max' | 'points' | 'margin'
>

/**
 * Represents a true-or-false question.
 */
export interface QuestionTrueFalseDto extends QuestionCommonDto {
  /**
   * The type of the question, set to `TrueFalse`.
   */
  type: QuestionType.TrueFalse

  /**
   * The correct answer for the question (true or false).
   */
  correct: boolean
}

/**
 * Represents a question where the user types an answer.
 */
export interface QuestionTypeAnswerDto extends QuestionCommonDto {
  /**
   * The type of the question, set to `TypeAnswer`.
   */
  type: QuestionType.TypeAnswer

  /**
   * The list of acceptable answers for the question.
   */
  options: string[]
}

/**
 * Represents any question type supported in the system.
 */
export type QuestionDto =
  | QuestionMultiChoiceDto
  | QuestionRangeDto
  | QuestionTrueFalseDto
  | QuestionTypeAnswerDto
  | QuestionZeroToOneHundredRangeDto

/**
 * Represents the correct answer for a quiz question.
 */
export type QuestionCorrectAnswerDto = {
  type: QuestionType
} & (
  | { type: QuestionType.MultiChoice; index: number }
  | { type: QuestionType.Range; value: number }
  | { type: QuestionType.TrueFalse; value: boolean }
  | { type: QuestionType.TypeAnswer; value: string }
)

/**
 * Data transfer object for a multi-choice correct answer.
 */
export type MultiChoiceQuestionCorrectAnswerDto = Extract<
  QuestionCorrectAnswerDto,
  { type: QuestionType.MultiChoice }
>

/**
 * Data transfer object for a range correct answer.
 */
export type RangeQuestionCorrectAnswerDto = Extract<
  QuestionCorrectAnswerDto,
  { type: QuestionType.Range }
>

/**
 * Data transfer object for a true-false correct answer.
 */
export type TrueFalseQuestionCorrectAnswerDto = Extract<
  QuestionCorrectAnswerDto,
  { type: QuestionType.TrueFalse }
>

/**
 * Data transfer object for a type-answer correct answer.
 */
export type TypeAnswerQuestionCorrectAnswerDto = Extract<
  QuestionCorrectAnswerDto,
  { type: QuestionType.TypeAnswer }
>
