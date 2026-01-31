import { QuizGameplaySummaryDto } from '@klurigo/common'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * API response model representing aggregated gameplay statistics for a quiz.
 */
export class QuizGameplaySummaryResponse implements QuizGameplaySummaryDto {
  /**
   * Number of completed games played using this quiz.
   */
  @ApiProperty({
    title: 'Count',
    description: 'Number of completed games played using this quiz.',
    required: true,
    type: Number,
    minimum: 0,
    example: 12,
  })
  readonly count: number

  /**
   * Sum of player counts across all completed games for this quiz.
   */
  @ApiProperty({
    title: 'Total Player Count',
    description:
      'Sum of player counts across all completed games for this quiz.',
    required: true,
    type: Number,
    minimum: 0,
    example: 48,
  })
  readonly totalPlayerCount: number

  /**
   * Optional difficulty estimate derived from gameplay statistics.
   *
   * Scale:
   * - 0 = very easy
   * - 1 = very difficult
   */
  @ApiPropertyOptional({
    title: 'Difficulty Percentage',
    description:
      'Optional difficulty estimate derived from gameplay statistics (0 = easy, 1 = difficult).',
    required: false,
    type: Number,
    minimum: 0,
    maximum: 1,
    example: 0.58,
  })
  readonly difficultyPercentage?: number

  /**
   * Timestamp of the most recently completed game using this quiz.
   */
  @ApiPropertyOptional({
    title: 'Last Played',
    description:
      'Timestamp of the most recently completed game using this quiz.',
    type: Date,
    example: '2026-01-26T09:00:00.000Z',
  })
  readonly lastPlayed?: Date
}
