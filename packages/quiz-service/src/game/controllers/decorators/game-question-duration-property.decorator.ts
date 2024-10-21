import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNumber } from 'class-validator'

export function GameQuestionDurationProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'The time limit for answering the question, in seconds. The allowed values are 5, 30, 60, or 120.',
      example: '30',
      required: true,
      enum: [5, 30, 60, 120],
    }),
    IsNumber(),
    IsIn([5, 30, 60, 120]),
  )
}
