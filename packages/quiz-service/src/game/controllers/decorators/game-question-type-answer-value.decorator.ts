import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export function GameQuestionTypeAnswerValue() {
  return applyDecorators(
    ApiProperty({
      description: 'The submitted answer to the type answer question.',
      example: 'Stockholm',
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
