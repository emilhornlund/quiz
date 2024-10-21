import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export function GameQuestionValueProperty(options?: { example: string }) {
  return applyDecorators(
    ApiProperty({
      description:
        'The actual question text. Must be between 3 and 120 characters long.',
      example: options?.example,
      required: true,
      minLength: 3,
      maxLength: 120,
      type: String,
    }),
    IsString(),
    MinLength(3),
    MaxLength(120),
  )
}
