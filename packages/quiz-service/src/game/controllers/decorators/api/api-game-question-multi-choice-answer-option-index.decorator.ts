import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from 'class-validator'

export function ApiGameQuestionMultiChoiceAnswerOptionIndex() {
  return applyDecorators(
    ApiProperty({
      description: 'The submitted option index for the multi option question.',
      example: 0,
      required: true,
      minimum: 0,
      maximum: 5,
      type: Number,
    }),
    IsNumber(),
    Min(0),
    Max(5),
  )
}
