import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { GameController } from './controllers/game.controller'
import { GameService } from './services'
import { Game, GameSchema } from './services/models/schemas'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Game.name,
        schema: GameSchema,
      },
    ]),
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
