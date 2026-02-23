import { DiscoveryResponseDto } from '@klurigo/common'
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { Public } from '../../authentication/controllers/decorators'
import { DiscoverySnapshotRepository } from '../repositories'

import { DiscoveryResponse } from './models'

/**
 * Controller for the discovery page endpoint.
 *
 * Serves a pre-computed snapshot of curated quiz rails stored in the
 * `discovery_snapshots` collection. This controller reads the latest snapshot
 * and returns it.
 *
 * All endpoints in this controller are public (no authentication required).
 */
@ApiTags('discovery')
@Controller('discover')
export class DiscoveryController {
  /**
   * Creates a DiscoveryController.
   *
   * @param discoverySnapshotRepository - Repository for reading the discovery snapshot.
   */
  constructor(
    private readonly discoverySnapshotRepository: DiscoverySnapshotRepository,
  ) {}

  /**
   * Returns the latest discovery snapshot.
   *
   * When no snapshot exists yet, returns `{ sections: [], generatedAt: null }`.
   *
   * @returns The discovery response containing ordered rails and the snapshot timestamp.
   */
  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve the discovery snapshot.',
    description:
      'Returns curated discovery rails and the timestamp of the latest snapshot computation.',
  })
  @ApiOkResponse({
    description: 'The latest discovery snapshot.',
    type: DiscoveryResponse,
  })
  public async getDiscovery(): Promise<DiscoveryResponseDto> {
    const snapshot = await this.discoverySnapshotRepository.findLatest()

    if (!snapshot) {
      return { sections: [], generatedAt: null }
    }

    return {
      sections: [],
      generatedAt: snapshot.generatedAt,
    }
  }
}
