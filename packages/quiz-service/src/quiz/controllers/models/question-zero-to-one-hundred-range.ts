import { ApiProperty } from '@nestjs/swagger'
import { QuestionType, QuestionZeroToOneHundredRangeDto } from '@quiz/common'
import { IsNumber, Max, Min } from 'class-validator'

import {
  ApiQuestionDurationProperty,
  ApiQuestionMediaProperty,
  ApiQuestionProperty,
  ApiQuestionTypeProperty,
} from '../decorators/api'

import { QuestionMedia } from './question-media'

/**
 * Represents a data transfer object for a range-based zero to one hundred question.
 */
export class QuestionZeroToOneHundredRange
  implements QuestionZeroToOneHundredRangeDto
{
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
  @ApiQuestionMediaProperty({ type: () => QuestionMedia })
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
