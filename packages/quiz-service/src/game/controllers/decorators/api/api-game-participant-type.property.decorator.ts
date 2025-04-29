import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { GameParticipantType } from '@quiz/common'
import { IsEnum } from 'class-validator'

/**
 * Decorator for documenting and validating a participant's type.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsEnum` to validate that the property is one of the defined enum values.
 */
export function ApiGameParticipantTypeProperty(type?: GameParticipantType) {
  return applyDecorators(
    ApiProperty({
      description: 'The type of the participant.',
      enum: GameParticipantType,
      required: true,
      example: type,
    }),
    IsEnum(GameParticipantType),
  )
}
