import {
  MediaType,
  QuestionCommonDto,
  QuestionMediaDto,
  QuestionMultiChoiceRequestDto,
  QuestionOptionDto,
  QuestionRangeAnswerMargin,
  QuestionRangeRequestDto,
  QuestionTrueFalseRequestDto,
  QuestionType,
  QuestionTypeAnswerRequestDto,
} from '@quiz/common'

import {
  ApiQuestionDurationProperty,
  ApiQuestionMediaProperty,
  ApiQuestionMediaTypeProperty,
  ApiQuestionMediaUrlProperty,
  ApiQuestionOptionCorrectProperty,
  ApiQuestionOptionsProperty,
  ApiQuestionPointsProperty,
  ApiQuestionProperty,
  ApiQuestionRangeAnswerMarginProperty,
  ApiQuestionRangeCorrectProperty,
  ApiQuestionRangeMaxProperty,
  ApiQuestionRangeMinProperty,
  ApiQuestionTrueFalseCorrectProperty,
  ApiQuestionTypeProperty,
  QuestionOptionValueProperty,
} from '../decorators/api'

/**
 * Represents media associated with a question, such as images or videos.
 */
export class QuestionMedia implements QuestionMediaDto {
  /**
   * The type of media (e.g., image, audio, video).
   */
  @ApiQuestionMediaTypeProperty()
  type: MediaType

  /**
   * The URL of the media.
   */
  @ApiQuestionMediaUrlProperty()
  url: string
}

/**
 * Common properties shared across all question request types.
 */
export class QuestionCommonRequest
  implements Omit<QuestionCommonDto, 'id' | 'created' | 'updated'>
{
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
}

/**
 * Represents an option for multiple-choice or type-answer questions.
 */
export class QuestionOption implements QuestionOptionDto {
  /**
   * The text or value of the option.
   */
  @QuestionOptionValueProperty()
  value: string

  /**
   * Indicates whether this option is correct.
   */
  @ApiQuestionOptionCorrectProperty()
  correct: boolean
}

/**
 * Represents a request to create or update a multiple-choice question.
 */
export class QuestionMultiChoiceRequest
  extends QuestionCommonRequest
  implements QuestionMultiChoiceRequestDto
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
 * Represents a request to create or update a range-based question.
 */
export class QuestionRangeRequest
  extends QuestionCommonRequest
  implements QuestionRangeRequestDto
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
 * Represents a request to create or update a true-or-false question.
 */
export class QuestionTrueFalseRequest
  extends QuestionCommonRequest
  implements QuestionTrueFalseRequestDto
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
 * Represents a request to create or update a type-answer question.
 */
export class QuestionTypeAnswerRequest
  extends QuestionCommonRequest
  implements QuestionTypeAnswerRequestDto
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
 * Represents a request for any supported question type.
 */
export type QuestionRequest =
  | QuestionMultiChoiceRequest
  | QuestionRangeRequest
  | QuestionTrueFalseRequest
  | QuestionTypeAnswerRequest
