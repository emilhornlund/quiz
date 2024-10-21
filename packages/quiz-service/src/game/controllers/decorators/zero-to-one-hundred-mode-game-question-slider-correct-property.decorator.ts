import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from 'class-validator'

export function ZeroToOneHundredModeGameQuestionSliderCorrectProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'The correct value for the slider, which must be between 0 and 100.',
      example: 71,
      required: true,
      minimum: 0,
      maximum: 100,
      type: Number,
    }),
    IsNumber(),
    Min(0),
    Max(100),
  )
}
