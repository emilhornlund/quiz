import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { GameRepository } from './repositories'
import { Game, GameSchema } from './repositories/models/schemas'

/**
 * description here
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
  providers: [Logger, GameRepository],
  exports: [GameRepository],
})
export class GameCoreModule {}
