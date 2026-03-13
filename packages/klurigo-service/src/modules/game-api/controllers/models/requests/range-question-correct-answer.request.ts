import {
  QuestionType,
  QUIZ_RANGE_MAX_VALUE,
  QUIZ_RANGE_MIN_VALUE,
  RangeQuestionCorrectAnswerDto,
} from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from 'class-validator'

import { ApiQuestionTypeProperty } from '../../../../quiz-api/controllers/decorators/api'

/**
 * Request model for submitting a correct answer to a Range question.
 *
 * Includes the `type` identifier and the correct numeric `value`.
 */
export class RangeQuestionCorrectAnswerRequest implements RangeQuestionCorrectAnswerDto {
  /**
   * The type of the question, set to `Range`.
   */
  @ApiQuestionTypeProperty({
    description: `The type of the question, which is set to ${QuestionType.Range} for this request.`,
    explicitType: QuestionType.Range,
  })
  type: QuestionType.Range

  @ApiProperty({
    title: 'Value',
    description: 'The correct value for the range answer.',
    required: true,
    minimum: QUIZ_RANGE_MIN_VALUE,
    maximum: QUIZ_RANGE_MAX_VALUE,
    type: Number,
    example: 50,
  })
  @IsNumber()
  @Min(QUIZ_RANGE_MIN_VALUE)
  @Max(QUIZ_RANGE_MAX_VALUE)
  value: number
}
