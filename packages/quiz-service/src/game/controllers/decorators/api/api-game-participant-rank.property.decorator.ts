import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { GAME_MAX_PLAYERS, GAME_MIN_PLAYERS } from '@quiz/common'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for documenting and validating a participant's rank.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to validate the property as a number.
 * - `@Min` to validate the minimum allowed rank.
 * - `@Max` to validate the maximum allowed rank.
 */
export function ApiGameParticipantRankProperty() {
  return applyDecorators(
    ApiProperty({
      description: 'description here',
      required: true,
      type: Number,
      minimum: GAME_MIN_PLAYERS,
      maximum: GAME_MAX_PLAYERS,
      example: 1,
    }),
    IsNumber(),
    Min(GAME_MIN_PLAYERS),
    Max(GAME_MAX_PLAYERS),
  )
}
