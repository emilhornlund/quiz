import { ApiProperty } from '@nestjs/swagger'
import { MessageDto } from '@quiz/common'

export class MessageResponse implements MessageDto {
  @ApiProperty({ example: 'Hello, World!' })
  value: string
}
