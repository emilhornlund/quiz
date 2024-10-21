import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min, Validate } from 'class-validator'

import { InRangeValidator } from './in-range-validator.decorator'

export function ClassicModeGameQuestionSliderCorrectProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'The correct value for the slider question, which must be within the range of min and max.',
      example: 50,
      required: true,
      minimum: -10000,
      maximum: 10000,
      type: Number,
    }),
    IsNumber(),
    Min(-10000),
    Max(10000),
    Validate(InRangeValidator, ['correct', 'min', 'max']),
  )
}
