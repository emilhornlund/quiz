import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNumber } from 'class-validator'

export function GameQuestionPointsProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'The number of points awarded for a correct answer. The allowed values are 0, 1000, or 2000.',
      example: '1000',
      required: true,
      enum: [0, 1000, 2000],
    }),
    IsNumber(),
    IsIn([0, 1000, 2000]),
  )
}
