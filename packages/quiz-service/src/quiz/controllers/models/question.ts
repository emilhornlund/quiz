import { ApiProperty } from '@nestjs/swagger'
import {
  MediaType,
  QuestionMediaDto,
  QuestionMultiChoiceDto,
  QuestionOptionDto,
  QuestionRangeAnswerMargin,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionType,
  QuestionTypeAnswerDto,
  QuestionZeroToOneHundredRangeDto,
} from '@quiz/common'
import { IsNumber, Max, Min, Validate } from 'class-validator'

import { InRangeValidator } from '../../../game/controllers/decorators'
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
  ApiQuestionRangeMaxProperty,
  ApiQuestionRangeMinProperty,
  ApiQuestionTrueFalseCorrectProperty,
  ApiQuestionTypeProperty,
  QuestionOptionValueProperty,
} from '../decorators/api'

/**
 * Represents a data transfer object for a media associated with a question, such as images or videos.
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
 * Represents a data transfer object for an option for multiple-choice or type-answer questions.
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
 * Represents a data transfer object for a multiple-choice question.
 */
export class QuestionMultiChoice implements QuestionMultiChoiceDto {
  /**
   * The type of the question, set to `MultiChoice`.
   */
  @ApiQuestionTypeProperty(QuestionType.MultiChoice)
  type: QuestionType.MultiChoice

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
   * The list of options for the question.
   */
  @ApiQuestionOptionsProperty()
  options: QuestionOption[]

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
 * Represents a data transfer object for a range-based question.
 */
export class QuestionRange implements QuestionRangeDto {
  /**
   * The type of the question, set to `Range`.
   */
  @ApiQuestionTypeProperty(QuestionType.Range)
  type: QuestionType.Range

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
  @ApiProperty({
    description:
      'The correct value for the range question, which must be within the range of min and max.',
    example: 50,
    required: true,
    minimum: -10000,
    maximum: 10000,
    type: Number,
  })
  @IsNumber()
  @Min(-10000)
  @Max(10000)
  @Validate(InRangeValidator, ['correct', 'min', 'max'])
  correct: number

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
 * Represents a data transfer object for a range-based zero to one hundred question.
 */
export class QuestionZeroToOneHundredRange
  implements QuestionZeroToOneHundredRangeDto
{
  /**
   * The type of the question, set to `Range`.
   */
  @ApiQuestionTypeProperty(QuestionType.Range)
  type: QuestionType.Range

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
   * The correct answer within the range.
   */
  @ApiProperty({
    description:
      'The correct value for the range question, which must be within the range of 0 and 100.',
    example: 50,
    required: true,
    minimum: 0,
    maximum: 100,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  correct: number

  /**
   * The duration in seconds allowed to answer the question.
   */
  @ApiQuestionDurationProperty()
  duration: number
}

/**
 * Represents a data transfer object for a true-or-false question.
 */
export class QuestionTrueFalse implements QuestionTrueFalseDto {
  /**
   * The type of the question, set to `TrueFalse`.
   */
  @ApiQuestionTypeProperty(QuestionType.TrueFalse)
  type: QuestionType.TrueFalse

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
   * The correct answer for the question (true or false).
   */
  @ApiQuestionTrueFalseCorrectProperty()
  correct: boolean

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
 * Represents a data transfer object for a type-answer question.
 */
export class QuestionTypeAnswer implements QuestionTypeAnswerDto {
  /**
   * The type of the question, set to `TypeAnswer`.
   */
  @ApiQuestionTypeProperty(QuestionType.TypeAnswer)
  type: QuestionType.TypeAnswer

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
   * The list of acceptable answers for the question.
   */
  @ApiQuestionOptionsProperty()
  options: QuestionOption[]

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
