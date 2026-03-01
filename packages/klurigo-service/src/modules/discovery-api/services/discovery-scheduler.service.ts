import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { MurLock } from 'murlock'

import { DiscoveryComputeService } from './discovery-compute.service'

/**
 * Scheduled service that refreshes the discovery snapshot twice daily.
 *
 * Fires at 06:00 and 18:00 UTC via `@Cron('0 0 6,18 * * *')`. Each
 * invocation delegates to {@link DiscoveryComputeService.compute}, which
 * scores all eligible quizzes, applies the per-rail dedupe policy, and
 * atomically replaces the singleton snapshot document.
 *
 * A distributed lock (`discovery_snapshot_lock`, 30 s timeout) ensures that
 * only one instance across the cluster executes the compute pipeline per
 * trigger, preventing duplicate writes and wasted work.
 */
@Injectable()
export class DiscoverySchedulerService {
  private readonly logger = new Logger(DiscoverySchedulerService.name)

  /**
   * Creates a DiscoverySchedulerService.
   *
   * @param discoveryComputeService - Service that computes and persists the discovery snapshot.
   */
  constructor(
    private readonly discoveryComputeService: DiscoveryComputeService,
  ) {}

  /**
   * Recomputes and persists the discovery snapshot.
   *
   * Runs at 06:00 and 18:00 UTC. The `@MurLock` decorator acquires the
   * `discovery_snapshot_lock` with a 30 000 ms timeout to guarantee
   * single-instance execution across a distributed deployment.
   */
  @Cron('0 0 6,18 * * *')
  @MurLock(30000, 'discovery_snapshot_lock')
  public async refreshSnapshot(): Promise<void> {
    this.logger.log('Starting discovery snapshot computation.')
    await this.discoveryComputeService.compute()
    this.logger.log('Discovery snapshot computation completed.')
  }
}
