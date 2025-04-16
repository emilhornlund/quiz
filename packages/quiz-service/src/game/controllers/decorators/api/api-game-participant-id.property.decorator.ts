import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

/**
 * Decorator for documenting and validating a participant's unique identifier.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsUUID` to enforce UUID format.
 */
export function ApiGameParticipantIdProperty() {
  return applyDecorators(
    ApiProperty({
      description: 'The unique identifier of the participant.',
      required: true,
      format: 'uuid',
      type: String,
    }),
    IsUUID(),
  )
}
