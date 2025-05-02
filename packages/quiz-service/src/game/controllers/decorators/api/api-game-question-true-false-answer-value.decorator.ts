import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export function ApiGameQuestionTrueFalseAnswerValue() {
  return applyDecorators(
    ApiProperty({
      description: 'The submitted answer to the true false question.',
      example: true,
      required: true,
      type: Boolean,
    }),
    IsBoolean(),
  )
}
