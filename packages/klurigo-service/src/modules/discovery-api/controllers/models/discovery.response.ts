import { DiscoveryResponseDto, DiscoverySectionDto } from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'

import { DiscoverySectionResponse } from './discovery-section.response'

/**
 * API response model for the discovery page endpoint.
 *
 * Implements {@link DiscoveryResponseDto} so the response shape is type-checked
 * against the shared contract defined in `@klurigo/common`.
 */
export class DiscoveryResponse implements DiscoveryResponseDto {
  /**
   * Ordered list of discovery rails.
   */
  @ApiProperty({
    title: 'Sections',
    description: 'Ordered list of discovery rails.',
    required: true,
    type: () => [DiscoverySectionResponse],
    example: [],
  })
  public readonly sections: DiscoverySectionDto[]

  /**
   * UTC timestamp of the most recent snapshot computation.
   *
   * Null when no snapshot has been computed yet (e.g. on first deployment).
   */
  @ApiProperty({
    title: 'Generated At',
    description:
      'UTC timestamp of the most recent snapshot computation. Null when no snapshot exists yet.',
    required: true,
    nullable: true,
    type: String,
    format: 'date-time',
    example: null,
  })
  public readonly generatedAt: Date | null
}
