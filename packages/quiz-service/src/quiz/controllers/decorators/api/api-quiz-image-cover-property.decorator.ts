import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsUrl } from 'class-validator'

/**
 * Decorator for documenting and validating the optional `imageCover` property of a quiz.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsOptional` and `@IsUrl` for URL validation.
 */
export function ApiQuizImageCoverProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Image Cover URL',
      description: 'The URL of the cover image for the quiz.',
      example: 'https://example.com/question-cover-image.png',
      required: false,
      format: 'url',
      type: String,
    }),
    IsOptional(),
    IsUrl(
      { protocols: ['http', 'https'] },
      { message: 'The image cover URL must be a valid URL.' },
    ),
  )
}
