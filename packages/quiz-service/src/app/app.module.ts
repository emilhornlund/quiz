import { Module } from '@nestjs/common'

import { CommonModule } from '../common'
import { GameModule } from '../game'

import { AppController } from './controllers'
import { AppService } from './services'

@Module({
  imports: [CommonModule, GameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
