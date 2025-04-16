import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'

import { GameResultParticipantResponse } from '../../models/response'

/**
 * Decorator for documenting and validating the participant object.
 *
 * Supports optional override of the property description.
 * Applies:
 * - `@ApiProperty` for nested type.
 * - `@ValidateNested` for validation.
 * - `@Type` for class-transformer support.
 */
export function ApiGameParticipantProperty(options?: { description?: string }) {
  return applyDecorators(
    ApiProperty({
      description: options.description,
      required: true,
      type: GameResultParticipantResponse,
    }),
    Type(() => GameResultParticipantResponse),
    ValidateNested({ each: true }),
  )
}
