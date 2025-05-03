import { ApiProperty } from '@nestjs/swagger'
import {
  QuestionRangeAnswerMargin,
  QuestionRangeDto,
  QuestionType,
} from '@quiz/common'
import { IsNumber, Max, Min, Validate } from 'class-validator'

import {
  ApiQuestionDurationProperty,
  ApiQuestionMediaProperty,
  ApiQuestionPointsProperty,
  ApiQuestionProperty,
  ApiQuestionRangeAnswerMarginProperty,
  ApiQuestionRangeMaxProperty,
  ApiQuestionRangeMinProperty,
  ApiQuestionTypeProperty,
} from '../decorators/api'
import { InRangeValidator } from '../decorators/api/in-range-validator.decorator'

import { QuestionMedia } from './question-media'

/**
 * Represents a data transfer object for a range-based question.
 */
export class QuestionRange implements QuestionRangeDto {
  /**
   * The type of the question, set to `Range`.
   */
  @ApiQuestionTypeProperty({
    description: `The type of the question, which is set to ${QuestionType.Range} for this request.`,
    explicitType: QuestionType.Range,
  })
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
