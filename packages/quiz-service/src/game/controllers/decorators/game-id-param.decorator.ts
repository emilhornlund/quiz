import { applyDecorators } from '@nestjs/common'
import { ApiParam } from '@nestjs/swagger'

export function GameIdParam() {
  return applyDecorators(
    ApiParam({
      name: 'gameID',
      description: 'The unique identifier for the game.',
      required: true,
      format: 'uuid',
      type: String,
    }),
  )
}
