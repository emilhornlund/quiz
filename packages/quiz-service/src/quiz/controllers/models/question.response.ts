import {
  QuestionCommonDto,
  QuestionMultiChoiceDto,
  QuestionRangeAnswerMargin,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionType,
  QuestionTypeAnswerDto,
} from '@quiz/common'

import {
  ApiQuestionCreatedProperty,
  ApiQuestionDurationProperty,
  ApiQuestionIdProperty,
  ApiQuestionMediaProperty,
  ApiQuestionOptionsProperty,
  ApiQuestionPointsProperty,
  ApiQuestionProperty,
  ApiQuestionRangeAnswerMarginProperty,
  ApiQuestionRangeCorrectProperty,
  ApiQuestionRangeMaxProperty,
  ApiQuestionRangeMinProperty,
  ApiQuestionTrueFalseCorrectProperty,
  ApiQuestionTypeProperty,
  ApiQuestionUpdatedProperty,
} from '../decorators/api'

import { QuestionMedia, QuestionOption } from './question.request'

/**
 * Common properties shared across all question response types.
 */
export class QuestionCommonResponse implements QuestionCommonDto {
  /**
   * The unique identifier for the question.
   */
  @ApiQuestionIdProperty()
  id: string

  /**
   * The text of the question.
   */
  @ApiQuestionProperty()
  question: string

  /**
   * Optional media associated with the question.
   */
  @ApiQuestionMediaProperty()
  media?: QuestionMedia

  /**
   * The points awarded for answering the question correctly.
   */
  @ApiQuestionPointsProperty()
  points: number

  /**
   * The duration in seconds allowed to answer the question.
   */
  @ApiQuestionDurationProperty()
  duration: number

  /**
   * The date and time when the question was created.
   */
  @ApiQuestionCreatedProperty()
  created: Date

  /**
   * The date and time when the question was last updated.
   */
  @ApiQuestionUpdatedProperty()
  updated: Date
}

/**
 * Represents the response for a multiple-choice question.
 */
export class QuestionMultiChoiceResponse
  extends QuestionCommonResponse
  implements QuestionMultiChoiceDto
{
  /**
   * The type of the question, set to `MultiChoice`.
   */
  @ApiQuestionTypeProperty(QuestionType.MultiChoice)
  type: QuestionType.MultiChoice

  /**
   * The list of options for the question.
   */
  @ApiQuestionOptionsProperty()
  options: QuestionOption[]
}

/**
 * Represents the response for a range-based question.
 */
export class QuestionRangeResponse
  extends QuestionCommonResponse
  implements QuestionRangeDto
{
  /**
   * The type of the question, set to `Range`.
   */
  @ApiQuestionTypeProperty(QuestionType.Range)
  type: QuestionType.Range

  /**
   * The minimum value of the range.
   */
  @ApiQuestionRangeMinProperty()
  min: number

  /**
   * The maximum value of the range.
   */
  @ApiQuestionRangeMaxProperty()
  max: number

  /**
   * The allowed margin of error for the correct answer.
   */
  @ApiQuestionRangeAnswerMarginProperty()
  margin: QuestionRangeAnswerMargin

  /**
   * The correct answer within the range.
   */
  @ApiQuestionRangeCorrectProperty()
  correct: number
}

/**
 * Represents the response for a true-or-false question.
 */
export class QuestionTrueFalseResponse
  extends QuestionCommonResponse
  implements QuestionTrueFalseDto
{
  /**
   * The type of the question, set to `TrueFalse`.
   */
  @ApiQuestionTypeProperty(QuestionType.TrueFalse)
  type: QuestionType.TrueFalse

  /**
   * The correct answer for the question (true or false).
   */
  @ApiQuestionTrueFalseCorrectProperty()
  correct: boolean
}

/**
 * Represents the response for a type-answer question.
 */
export class QuestionTypeAnswerResponse
  extends QuestionCommonResponse
  implements QuestionTypeAnswerDto
{
  /**
   * The type of the question, set to `TypeAnswer`.
   */
  @ApiQuestionTypeProperty(QuestionType.TypeAnswer)
  type: QuestionType.TypeAnswer

  /**
   * The list of acceptable answers for the question.
   */
  @ApiQuestionOptionsProperty()
  options: QuestionOption[]
}

/**
 * Represents a response for any supported question type.
 */
export type QuestionResponse =
  | QuestionMultiChoiceResponse
  | QuestionRangeResponse
  | QuestionTrueFalseResponse
  | QuestionTypeAnswerResponse
