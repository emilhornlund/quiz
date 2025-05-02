import { applyDecorators } from '@nestjs/common'
import { ApiParam } from '@nestjs/swagger'

export function ApiGameIdParam() {
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
