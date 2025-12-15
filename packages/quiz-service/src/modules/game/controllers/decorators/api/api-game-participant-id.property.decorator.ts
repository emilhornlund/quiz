import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

/**
 * Decorator for documenting and validating the `id` property of a participant.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsUUID` to validate the value as a UUID.
 */
export function ApiGameParticipantIdProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'ID',
      description: 'The unique identifier of the participant.',
      required: true,
      format: 'uuid',
      type: String,
    }),
    IsUUID(),
  )
}
