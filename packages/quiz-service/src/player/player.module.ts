import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { PlayerService } from './services'
import { Player, PlayerSchema } from './services/models/schemas'

/**
 * Module for managing player-related operations.
 *
 * This module defines the PlayerService and the schema for the Player collection.
 * It is responsible for handling player creation and data persistence.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Player.name,
        schema: PlayerSchema,
      },
    ]),
  ],
  providers: [Logger, PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
