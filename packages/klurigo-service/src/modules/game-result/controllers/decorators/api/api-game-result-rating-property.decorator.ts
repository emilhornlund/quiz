import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

import { GameResultRatingResponse } from '../../models/responses/game-result-rating.response'

/**
 * Decorator for documenting and validating the `rating` property.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@Type` to transform the value into `GameResultRatingResponse`.
 * - `@ValidateNested` to validate nested properties.
 */
export function ApiGameResultRatingProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Rating',
      description:
        'The participant’s rating for the quiz, if the participant has rated it.',
      required: true,
      type: GameResultRatingResponse,
    }),
    Type(() => GameResultRatingResponse),
  )
}
