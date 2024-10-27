import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'

export function GameTokenProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'A JWT token assigned to the game, used for authenticating game-related requests.',
      required: true,
      type: String,
    }),
  )
}
