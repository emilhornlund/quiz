import {
  DiscoveryQuizCardDto,
  DiscoverySectionKey,
  DiscoverySectionPageResponseDto,
} from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'

import { DiscoveryQuizCardResponse } from './discovery-quiz-card.response'

/**
 * API response model for the offset-paginated "see all" view of a single
 * discovery rail section.
 *
 * Implements {@link DiscoverySectionPageResponseDto} so the response shape is
 * type-checked against the shared contract defined in `@klurigo/common`.
 *
 * Pagination is offset-based to match the convention used by
 * `PaginatedQuizResponse` elsewhere in the API.
 */
export class PaginatedDiscoverySectionResponse implements DiscoverySectionPageResponseDto {
  /**
   * The rail identifier this page belongs to.
   */
  @ApiProperty({
    title: 'Key',
    description: 'The rail identifier this page belongs to.',
    enum: DiscoverySectionKey,
    example: DiscoverySectionKey.TOP_RATED,
  })
  public readonly key: DiscoverySectionKey

  /**
   * Human-readable section heading, matching the value from DiscoverySectionDto.
   */
  @ApiProperty({
    title: 'Title',
    description:
      'Human-readable section heading, matching the value from DiscoverySectionDto.',
    example: 'Top Rated',
  })
  public readonly title: string

  /**
   * Ordered quiz cards for the current page.
   *
   * The ordering mirrors the snapshot's stored entry order (descending by
   * score at compute time). No re-sorting is applied at read time.
   */
  @ApiProperty({
    title: 'Results',
    description:
      'Ordered quiz cards for the current page. Ordering mirrors the snapshot entry order.',
    type: () => [DiscoveryQuizCardResponse],
  })
  public readonly results: DiscoveryQuizCardDto[]

  /**
   * Total number of entries stored in the snapshot for this rail.
   *
   * This value is bounded by snapshot capacity constants
   * (DISCOVERY_RAIL_CAP_FEATURED for FEATURED, DISCOVERY_RAIL_CAP_STANDARD
   * for all other rails) and is NOT a live database row count. Use it to
   * determine whether more pages are available.
   */
  @ApiProperty({
    title: 'Snapshot Total',
    description:
      'Total number of entries stored in the snapshot for this rail. Bounded by snapshot capacity constants, not a live database count.',
    type: Number,
    minimum: 0,
    example: 150,
  })
  public readonly snapshotTotal: number

  /**
   * Maximum number of quiz cards returned in a single page.
   */
  @ApiProperty({
    title: 'Limit',
    description: 'Maximum number of quiz cards returned in a single page.',
    type: Number,
    minimum: 1,
    maximum: 50,
    example: 20,
  })
  public readonly limit: number

  /**
   * Zero-based index of the first item on this page within the snapshot.
   */
  @ApiProperty({
    title: 'Offset',
    description:
      'Zero-based index of the first item on this page within the snapshot.',
    type: Number,
    minimum: 0,
    example: 0,
  })
  public readonly offset: number
}
