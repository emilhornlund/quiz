import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min, Validate } from 'class-validator'

import { MinMaxValidator } from './min-max-validator.dectorator'

export function ClassicModeGameQuestionRangeMinProperty() {
  return applyDecorators(
    ApiProperty({
      description: 'The minimum possible value for the range.',
      example: 0,
      required: true,
      minimum: -10000,
      maximum: 10000,
      type: Number,
    }),
    IsNumber(),
    Min(-10000),
    Max(10000),
    Validate(MinMaxValidator, ['min', 'max']),
  )
}
