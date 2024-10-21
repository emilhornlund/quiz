import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export function ClassicModeGameQuestionTrueFalseCorrectProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'Indicates whether the statement is correct (true) or not (false).',
      example: true,
      required: true,
      type: Boolean,
    }),
    IsBoolean(),
  )
}
