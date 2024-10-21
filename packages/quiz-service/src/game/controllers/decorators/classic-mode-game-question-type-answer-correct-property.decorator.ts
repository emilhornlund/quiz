import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export function ClassicModeGameQuestionTypeAnswerCorrectProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'The correct answer to the question. Must be between 1 and 75 characters long.',
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
