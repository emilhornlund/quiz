import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsUrl } from 'class-validator'

/**
 * Decorator for documenting and validating the `imageURL` property in Pin questions.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsUrl` to enforce a valid HTTP(S) URL format.
 */
export function ApiQuestionPinImageUrlProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Image URL',
      description: 'Public URL of the image used for pin placement.',
      example: 'https://example.com/question-image.png',
      required: true,
      format: 'url',
      type: String,
    }),
    IsUrl({}, { message: 'The image URL must be a valid URL.' }),
  )
}
