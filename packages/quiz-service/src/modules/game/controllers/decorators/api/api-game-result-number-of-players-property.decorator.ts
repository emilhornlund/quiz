import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { GAME_MAX_PLAYERS, GAME_MIN_PLAYERS } from '@quiz/common'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for documenting and validating the `numberOfPlayers` property.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to validate the value as a number.
 * - `@Min` to enforce a minimum of `GAME_MIN_PLAYERS`.
 * - `@Max` to enforce a maximum of `GAME_MAX_PLAYERS`.
 */
export function ApiGameResultNumberOfPlayersProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Number Of Players',
      description:
        'Total number of players who participated in the game (excludes the host).',
      required: true,
      type: Number,
      minimum: GAME_MIN_PLAYERS,
      maximum: GAME_MAX_PLAYERS,
      example: 10,
    }),
    IsNumber(),
    Min(GAME_MIN_PLAYERS),
    Max(GAME_MAX_PLAYERS),
  )
}
