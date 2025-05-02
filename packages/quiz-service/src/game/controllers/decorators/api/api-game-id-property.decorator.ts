import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'

export function ApiGameIdProperty(options?: { description: string }) {
  return applyDecorators(
    ApiProperty({
      description: options?.description,
      required: true,
      format: 'uuid',
      type: String,
    }),
  )
}
