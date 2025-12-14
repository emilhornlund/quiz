import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsUrl } from 'class-validator'

/**
 * Decorator for documenting and validating the `url` property of a question's media.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsUrl` to validate the value as a valid URL.
 */
export function ApiQuestionMediaUrlProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Media URL',
      description: 'The URL of the media. Must be a valid URL.',
      example: 'https://example.com/question-image.png',
      required: true,
      format: 'url',
      type: String,
    }),
    IsUrl({}, { message: 'The media URL must be a valid URL.' }),
  )
}
