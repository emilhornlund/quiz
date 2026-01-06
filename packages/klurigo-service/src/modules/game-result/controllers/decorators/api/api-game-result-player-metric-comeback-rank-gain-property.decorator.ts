import { GAME_MAX_PLAYERS } from '@klurigo/common'
import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for documenting and validating the `comebackRankGain` metric for a player.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to ensure the value is a number.
 * - `@Min to enforce the minimum metric value.
 * - `@Max to enforce the maximum metric value.
 */
export function ApiGameResultPlayerMetricComebackRankGainProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Comeback Rank Gain',
      description:
        'The net number of positions the player recovered by the end of the game, calculated as worstRank - finalRank. This value is never negative.',
      required: true,
      type: Number,
      minimum: 0,
      maximum: GAME_MAX_PLAYERS - 1,
      example: 1,
    }),
    IsNumber(),
    Min(0),
    Max(GAME_MAX_PLAYERS - 1),
  )
}
