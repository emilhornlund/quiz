import { ApiProperty } from '@nestjs/swagger'
import { QuestionType, TrueFalseQuestionCorrectAnswerDto } from '@quiz/common'
import { IsBoolean } from 'class-validator'

import { ApiQuestionTypeProperty } from '../../../../quiz/controllers/decorators/api'

/**
 * Request model for submitting a correct answer to a True/False question.
 *
 * Includes the `type` identifier and the boolean `value` representing the correct answer.
 */
export class TrueFalseQuestionCorrectAnswerRequest implements TrueFalseQuestionCorrectAnswerDto {
  /**
   * The type of the question, set to `TrueFalse`.
   */
  @ApiQuestionTypeProperty({
    description: `The type of the question, which is set to ${QuestionType.TrueFalse} for this request.`,
    explicitType: QuestionType.TrueFalse,
  })
  type: QuestionType.TrueFalse

  @ApiProperty({
    title: 'Value',
    description: 'The correct value for the true-false answer.',
    required: true,
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  value: boolean
}
