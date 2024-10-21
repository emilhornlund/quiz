import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsUrl } from 'class-validator'

export function GameQuestionImageUrlProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'Optional URL for an image related to the question. If provided, it must be a valid URL.',
      example: 'https://example.com/question-image.png',
      required: false,
      format: 'url',
      type: String,
    }),
    IsUrl(),
    IsOptional(),
  )
}
