import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

import { GameResultQuizResponse } from '../../models/responses/game-result-quiz.response'

/**
 * Decorator for documenting and validating the `quiz` property.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@Type` to transform the value into `GameResultQuizResponse`.
 * - `@ValidateNested` to validate nested properties.
 */
export function ApiGameResultQuizProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Quiz',
      description:
        'Quiz metadata associated with the completed game, including whether the caller can create a new live game based on this quiz.',
      required: true,
      type: GameResultQuizResponse,
    }),
    Type(() => GameResultQuizResponse),
  )
}
