import {
  GameResultRatingDto,
  QUIZ_RATING_STARS_MAX,
  QUIZ_RATING_STARS_MIN,
} from '@klurigo/common'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * API response model representing a participant's rating for the quiz.
 *
 * Includes the submitted star rating and an optional free-text comment.
 */
export class GameResultRatingResponse implements GameResultRatingDto {
  /**
   * The star rating value for the quiz (1–5).
   */
  @ApiProperty({
    title: 'Stars',
    description: 'The star rating value for the quiz (1–5).',
    required: true,
    type: Number,
    minimum: QUIZ_RATING_STARS_MIN,
    maximum: QUIZ_RATING_STARS_MAX,
    example: 5,
  })
  readonly stars: number

  /**
   * Optional free-text feedback about the quiz.
   */
  @ApiPropertyOptional({
    title: 'Comment',
    description: 'Optional free-text feedback about the quiz.',
    type: String,
    example: 'Nice quiz',
  })
  readonly comment?: string
}
