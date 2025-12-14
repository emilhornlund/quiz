import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { MediaType } from '@quiz/common'
import { IsEnum } from 'class-validator'

/**
 * Decorator for documenting and validating the `type` property of a question's media.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsEnum` to validate the value as a media type.
 */
export function ApiQuestionMediaTypeProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Media Type',
      description:
        'The type of media (image, video, audio) associated with the question.',
      example: MediaType.Image,
      required: true,
      enum: [MediaType],
    }),
    IsEnum(MediaType, { message: 'Invalid media type.' }),
  )
}
