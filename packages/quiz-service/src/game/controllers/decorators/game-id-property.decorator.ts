import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'

export function GameIdProperty() {
  return applyDecorators(
    ApiProperty({
      description: 'The unique identifier for the created game.',
      required: true,
      format: 'uuid',
      type: String,
    }),
  )
}
