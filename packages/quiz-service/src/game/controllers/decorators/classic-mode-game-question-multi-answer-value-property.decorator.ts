import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export function ClassicModeGameQuestionMultiAnswerValueProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'The text of the answer. Must be between 1 and 75 characters long.',
      example: 'Paris',
      required: true,
      minLength: 1,
      maxLength: 75,
      type: String,
    }),
    IsString(),
    MinLength(1),
    MaxLength(75),
  )
}
