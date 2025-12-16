import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { GAME_MAX_PLAYERS, GAME_MIN_PLAYERS } from '@quiz/common'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for documenting and validating the `rank` metric for a player.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to ensure the value is a number.
 * - `@Min` to enforce the minimum player count.
 * - `@Max` to enforce the maximum player count.
 */
export function ApiGameResultPlayerMetricRankProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Rank',
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
