import {
  DiscoveryQuizCardDto,
  DiscoverySectionDto,
  DiscoverySectionKey,
} from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'

import { DiscoveryQuizCardResponse } from './discovery-quiz-card.response'

/**
 * API response model for a single discovery rail section.
 *
 * Implements {@link DiscoverySectionDto} so the response shape is type-checked
 * against the shared contract defined in `@klurigo/common`.
 *
 * A section represents one horizontal rail containing a curated list of quizzes.
 * The `key` determines which curation algorithm populated the rail.
 */
export class DiscoverySectionResponse implements DiscoverySectionDto {
  /**
   * The algorithmic identifier for this rail.
   */
  @ApiProperty({
    title: 'Key',
    description: 'The algorithmic identifier for this rail.',
    enum: DiscoverySectionKey,
    example: DiscoverySectionKey.TRENDING,
  })
  public readonly key: DiscoverySectionKey

  /**
   * Human-readable section heading shown above the rail.
   */
  @ApiProperty({
    title: 'Title',
    description: 'Human-readable section heading shown above the rail.',
    example: 'Trending right now',
  })
  public readonly title: string

  /**
   * Optional subtitle or contextual description for the rail.
   *
   * For CATEGORY_SPOTLIGHT this typically names the featured category.
   */
  @ApiProperty({
    title: 'Description',
    description:
      'Optional subtitle or contextual description for the rail. For CATEGORY_SPOTLIGHT this typically names the featured category.',
    required: false,
    example: 'Fresh picks in Geography',
  })
  public readonly description?: string

  /**
   * Ordered list of quiz cards to display in this rail.
   *
   * The ordering reflects the rail's curation algorithm (e.g. by trending score,
   * by rating, by recency).
   */
  @ApiProperty({
    title: 'Quizzes',
    description:
      "Ordered list of quiz cards to display in this rail. Ordering reflects the rail's curation algorithm.",
    type: () => [DiscoveryQuizCardResponse],
    example: [],
  })
  public readonly quizzes: DiscoveryQuizCardDto[]
}
