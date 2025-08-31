import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for documenting and validating the `positionY` property.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber`, `@Min(0)`, `@Max(1)` to enforce a normalized 0..1 coordinate.
 */
export function ApiQuestionPinPositionYProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Position Y',
      description: 'Y coordinate normalized to image height (0..1).',
      example: 0.5,
      required: true,
      minimum: 0,
      maximum: 1,
      type: Number,
    }),
    IsNumber(),
    Min(0),
    Max(1),
  )
}
