import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from 'class-validator'

export function GameQuestionRangeAnswerValue() {
  return applyDecorators(
    ApiProperty({
      description: 'The submitted value for the range question.',
      example: 50,
      required: true,
      minimum: -10000,
      maximum: 10000,
      type: Number,
    }),
    IsNumber(),
    Min(-10000),
    Max(10000),
  )
}
