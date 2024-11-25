import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QuestionRangeAnswerMargin } from '@quiz/common'
import { IsEnum } from 'class-validator'

export function GameQuestionRangeAnswerMarginProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'Specifies the margin of error allowed for a range question. Determines how close a player’s answer must be to the correct value to be considered correct or partially correct. The margin can be one of the following:\n' +
        '- `None`: Only the exact correct answer is accepted.\n' +
        '- `Low`: Accepts answers within 5% of the correct value.\n' +
        '- `Medium`: Accepts answers within 10% of the correct value.\n' +
        '- `High`: Accepts answers within 20% of the correct value.\n' +
        '- `Maximum`: Accepts all answers, with closer answers earning higher precision scores.',
      enum: [QuestionRangeAnswerMargin],
      example: QuestionRangeAnswerMargin.Medium,
      required: true,
      type: String,
    }),
    IsEnum(QuestionRangeAnswerMargin),
  )
}
