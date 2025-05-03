import { Controller, Get } from '@nestjs/common'
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus'

import { Public } from '../../auth/controllers/decorators'
import { RedisHealthIndicator } from '../indicators'

@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      // MongoDB check
      async () => this.mongoose.pingCheck('mongodb'),

      // Redis check
      async () => this.redis.pingCheck('redis'),
    ])
  }
}
