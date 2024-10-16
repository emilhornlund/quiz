import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'

import { AppService } from '../services'

import { MessageResponse } from './models'

@ApiTags('hello')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/hello')
  @ApiOkResponse({ description: 'Hello, World!', type: MessageResponse })
  getHello(): MessageResponse {
    return this.appService.getHello()
  }
}
