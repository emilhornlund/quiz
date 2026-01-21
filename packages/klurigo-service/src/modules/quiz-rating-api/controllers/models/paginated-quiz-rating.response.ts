import { PaginatedQuizRatingDto } from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'

import { QuizRatingResponse } from './quiz-rating.response'

/**
 * API response model representing a paginated list of quiz ratings.
 *
 * Includes the current page of rating results along with pagination metadata.
 */
export class PaginatedQuizRatingResponse implements PaginatedQuizRatingDto {
  /**
   * The rating results for the current page.
   */
  @ApiProperty({
    title: 'Results',
    description: 'The rating results for the current page.',
    required: true,
    type: [QuizRatingResponse],
  })
  results: QuizRatingResponse[]

  /**
   * The total number of ratings available for the given query (across all pages).
   */
  @ApiProperty({
    title: 'Total',
    description:
      'The total number of ratings available for the given query (across all pages).',
    required: true,
    type: Number,
    example: 128,
  })
  total: number

  /**
   * The maximum number of results returned in this page.
   */
  @ApiProperty({
    title: 'Limit',
    description: 'The maximum number of results returned in this page.',
    required: true,
    type: Number,
    example: 25,
  })
  limit: number

  /**
   * The number of results skipped before returning this page (zero-based).
   */
  @ApiProperty({
    title: 'Offset',
    description:
      'The number of results skipped before returning this page (zero-based).',
    required: true,
    type: Number,
    example: 0,
  })
  offset: number
}
