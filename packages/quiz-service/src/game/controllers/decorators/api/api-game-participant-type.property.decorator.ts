import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { GameParticipantType } from '@quiz/common'
import { IsEnum } from 'class-validator'

/**
 * Decorator for documenting and validating the `type` property of a participant.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsEnum` to ensure the value is a valid participant type.
 */
export function ApiGameParticipantTypeProperty(type?: GameParticipantType) {
  return applyDecorators(
    ApiProperty({
      title: 'Type',
      description: 'The type of the participant.',
      enum: GameParticipantType,
      required: true,
      example: type,
    }),
    IsEnum(GameParticipantType),
  )
}
