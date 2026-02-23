import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { GameCoreModule } from '../game-core'
import { QuizCoreModule } from '../quiz-core'

import { DiscoveryController } from './controllers'
import { DiscoverySnapshotRepository } from './repositories'
import {
  DiscoverySnapshot,
  DiscoverySnapshotSchema,
} from './repositories/models/schemas'
import { DiscoveryComputeService } from './services'

/**
 * NestJS module for the discovery API surface.
 *
 * Provides:
 * - `DiscoveryController` for the `GET /discover` endpoint.
 * - `DiscoverySnapshotRepository` for reading and writing the discovery snapshot
 * - `DiscoveryComputeService` for computing discovery snapshots
 *
 * Imports:
 * - `MongooseModule` registering the `discovery_snapshots` collection schema.
 * - `QuizCoreModule` for quiz repository access.
 * - `GameCoreModule` for game repository access.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DiscoverySnapshot.name,
        schema: DiscoverySnapshotSchema,
      },
    ]),
    QuizCoreModule,
    GameCoreModule,
  ],
  controllers: [DiscoveryController],
  providers: [DiscoverySnapshotRepository, DiscoveryComputeService],
  exports: [DiscoverySnapshotRepository, DiscoveryComputeService],
})
export class DiscoveryApiModule {}
