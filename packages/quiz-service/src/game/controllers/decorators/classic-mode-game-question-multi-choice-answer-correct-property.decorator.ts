import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export function ClassicModeGameQuestionMultiChoiceAnswerCorrectProperty() {
  return applyDecorators(
    ApiProperty({
      description: 'Indicates whether this answer is correct or not.',
      example: true,
      required: true,
      type: Boolean,
    }),
    IsBoolean(),
  )
}
