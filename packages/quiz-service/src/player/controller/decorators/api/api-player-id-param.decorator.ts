import { applyDecorators } from '@nestjs/common'
import { ApiParam } from '@nestjs/swagger'

/**
 * Decorator to define the `playerID` parameter for API endpoints.
 *
 * Adds Swagger documentation for the `playerID` parameter.
 * - `name`: `playerID`
 * - `description`: The unique identifier for the player.
 * - `required`: true
 * - `format`: uuid
 * - `type`: string
 *
 * @returns The decorated API parameter.
 */
export function ApiPlayerIDParam() {
  return applyDecorators(
    ApiParam({
      name: 'playerID',
      description: 'The unique identifier for the player.',
      required: true,
      format: 'uuid',
      type: String,
    }),
  )
}
