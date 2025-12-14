import { ApiProperty } from '@nestjs/swagger'
import { QuestionType, RangeQuestionCorrectAnswerDto } from '@quiz/common'
import { IsNumber, Max, Min } from 'class-validator'

import { ApiQuestionTypeProperty } from '../../../../modules/quiz/controllers/decorators/api'

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
    minimum: -10000,
    maximum: 10000,
    type: Number,
    example: 50,
  })
  @IsNumber()
  @Min(-10000)
  @Max(10000)
  value: number
}
