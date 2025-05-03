import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

/**
 * Decorator for documenting the `id` property of a player.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsUUID` to validate the value as a UUID.
 */
export function ApiPlayerIdProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'ID',
      description: 'The unique identifier of the player.',
      type: String,
      format: 'uuid',
    }),
    IsUUID(),
  )
}
