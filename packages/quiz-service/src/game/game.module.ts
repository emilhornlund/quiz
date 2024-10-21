import { Module } from '@nestjs/common'

import { GameController } from './controllers/game.controller'
import { GameService } from './services'

@Module({
  imports: [],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
