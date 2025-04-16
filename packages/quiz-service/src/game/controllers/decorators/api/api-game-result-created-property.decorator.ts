import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsDateString } from 'class-validator'

/**
 * Decorator for the `created` timestamp field in game result responses.
 *
 * Ensures the value is a valid ISO 8601 date string and documents it in Swagger.
 */
export function ApiGameResultCreatedProperty() {
  return applyDecorators(
    ApiProperty({
      description: 'The date and time when the game session was created.',
      required: true,
      type: Date,
    }),
    IsDateString(
      {},
      {
        message: 'The created date must be a valid ISO 8601 date string.',
      },
    ),
  )
}
