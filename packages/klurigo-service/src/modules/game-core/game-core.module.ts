import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { GameAnswerRepository, GameRepository } from './repositories'
import { Game, GameSchema } from './repositories/models/schemas'

/**
 * GameCoreModule provides core persistence and infrastructure used by game-related modules.
 *
 * Exports:
 * - `GameRepository` for MongoDB-backed game documents.
 * - `GameAnswerRepository` for Redis-backed current-question answer storage.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Game.name,
        schema: GameSchema,
      },
    ]),
  ],
  providers: [Logger, GameRepository, GameAnswerRepository],
  exports: [GameRepository, GameAnswerRepository],
})
export class GameCoreModule {}
