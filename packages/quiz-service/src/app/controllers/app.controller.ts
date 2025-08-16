import { Controller, Get } from '@nestjs/common'

import { Public } from '../../auth/controllers/decorators'

@Controller()
export class AppController {
  @Public()
  @Get('/debug-sentry')
  getError() {
    throw new Error('My first Sentry error from quiz-service!')
  }
}
