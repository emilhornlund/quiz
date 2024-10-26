import { Module } from '@nestjs/common'

import { CommonModule } from '../common'
import { GameModule } from '../game'

@Module({
  imports: [CommonModule, GameModule],
})
export class AppModule {}
