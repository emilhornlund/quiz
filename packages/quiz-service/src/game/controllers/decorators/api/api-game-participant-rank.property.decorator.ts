import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { GAME_MAX_PLAYERS, GAME_MIN_PLAYERS } from '@quiz/common'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for documenting and validating the `rank` property of a participant.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to ensure the value is a number.
 * - `@Min` to enforce the minimum value.
 * - `@Max` to enforce the maximum value.
 */
export function ApiGameParticipantRankProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Rank',
      description:
        'The final placement of the participant, starting at 1 for the winner.',
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
