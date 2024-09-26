import { Injectable } from '@nestjs/common'
import { MessageDto } from '@quiz/common'

@Injectable()
export class AppService {
  getHello(): MessageDto {
    return { value: 'Hello, World!' }
  }
}
