import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { MediaType } from '@quiz/common'
import { IsEnum } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `type` property in media.
 *
 * This decorator applies validation and API documentation to the media type field.
 * It ensures that the property:
 * - Is required.
 * - Is one of the allowed media types: `IMAGE`, `AUDIO`, or `VIDEO`.
 *
 * Example usage:
 * ```typescript
 * import { ApiQuestionMediaTypeProperty } from './decorators';
 *
 * export class QuestionMediaRequest {
 *   @ApiQuestionMediaTypeProperty()
 *   type: MediaType;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to include metadata in the OpenAPI documentation.
 * - `@IsEnum` to enforce the value must be one of the allowed `MediaType` values.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuestionMediaTypeProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description:
        'The type of media (image, video, audio) associated with the question.',
      example: MediaType.Image,
      required: true,
      enum: [MediaType],
    }),
    IsEnum(MediaType, { message: 'Invalid media type.' }),
  )
}
