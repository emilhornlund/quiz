import { GameResultQuizDto } from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

import { ApiQuizIdProperty } from '../../../../quiz-api/controllers/decorators/api'

/**
 * API response structure representing quiz metadata included in a game result.
 */
export class GameResultQuizResponse implements GameResultQuizDto {
  /**
   * The unique identifier of the quiz associated with the completed game.
   */
  @ApiQuizIdProperty()
  readonly id: string

  /**
   * Indicates whether the caller is allowed to submit a rating for this quiz.
   *
   * This flag is evaluated in the context of the requesting participant and is typically `false`
   * for the quiz owner (owners cannot rate their own quizzes).
   */
  @ApiProperty({
    title: 'Can rate quiz',
    description:
      'Whether the caller is allowed to submit a rating for this quiz. Typically false for the quiz owner.',
    example: true,
    required: true,
    type: Boolean,
  })
  @IsBoolean()
  readonly canRateQuiz: boolean

  /**
   * Indicates whether the caller can create a new live game based on this quiz.
   *
   * This is typically `true` when:
   * - the caller is the quiz owner, or
   * - the quiz is publicly visible.
   */
  @ApiProperty({
    title: 'Can create live game',
    description:
      'Whether the caller can create a new live game based on this quiz. Typically true for the quiz owner or when the quiz is public.',
    example: true,
    required: true,
    type: Boolean,
  })
  @IsBoolean()
  readonly canHostLiveGame: boolean
}
