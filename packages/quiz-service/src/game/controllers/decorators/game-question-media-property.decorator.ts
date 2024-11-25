import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsObject, IsOptional, ValidateNested } from 'class-validator'

import { CreateCommonMediaRequest } from '../models/requests/create-common-media.request'

export function GameQuestionMediaProperty() {
  return applyDecorators(
    ApiProperty({
      description: '',
      required: false,
      type: CreateCommonMediaRequest,
    }),
    IsOptional(),
    IsObject(),
    ValidateNested(),
    Type(() => CreateCommonMediaRequest),
  )
}
