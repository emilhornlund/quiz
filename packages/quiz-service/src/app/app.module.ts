import { Module } from '@nestjs/common'

import { CommonModule } from '../common'

import { AppController } from './controllers'
import { AppService } from './services'

@Module({
  imports: [CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
