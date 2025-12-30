import { Module } from '@nestjs/common'
import { MongooseHealthIndicator, TerminusModule } from '@nestjs/terminus'

import { HealthController } from './controllers'
import { RedisHealthIndicator } from './indicators'

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [MongooseHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
