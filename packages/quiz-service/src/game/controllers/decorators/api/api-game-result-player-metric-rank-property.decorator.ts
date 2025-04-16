import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { GAME_MAX_PLAYERS, GAME_MIN_PLAYERS } from '@quiz/common'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for the rank field in a player's performance metrics.
 *
 * Validates that the value is a number and provides Swagger documentation.
 */
export function ApiGameResultPlayerMetricRankProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        "The player's final rank in the game (1 = first place, etc.).",
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
