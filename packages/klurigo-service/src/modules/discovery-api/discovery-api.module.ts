import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { DiscoveryController } from './controllers'
import { DiscoverySnapshotRepository } from './repositories'
import {
  DiscoverySnapshot,
  DiscoverySnapshotSchema,
} from './repositories/models/schemas'

/**
 * NestJS module for the discovery API surface.
 *
 * Provides:
 * - `DiscoveryController` for the `GET /discover` endpoint.
 * - `DiscoverySnapshotRepository` for reading and writing the discovery snapshot
 *
 * Imports:
 * - `MongooseModule` registering the `discovery_snapshots` collection schema.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DiscoverySnapshot.name,
        schema: DiscoverySnapshotSchema,
      },
    ]),
  ],
  controllers: [DiscoveryController],
  providers: [DiscoverySnapshotRepository],
  exports: [DiscoverySnapshotRepository],
})
export class DiscoveryApiModule {}
