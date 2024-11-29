import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsUrl } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `imageCoverURL` property.
 *
 * This decorator applies validation and API documentation to the `imageCoverURL` field of a quiz.
 * It ensures that the property:
 * - Is a valid URL.
 * - Uses either the `http` or `https` protocol.
 *
 * Example usage:
 * ```typescript
 * import { QuizImageCoverProperty } from './decorators';
 *
 * export class CreateQuizDto {
 *   @QuizImageCoverProperty()
 *   imageCoverURL: string;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to define the OpenAPI documentation for the property.
 * - `@IsUrl` to ensure the property is a valid URL with specific protocol validation.
 *
 * Description:
 * - The `imageCoverURL` property represents the URL of the cover image for the quiz.
 *
 * Validation:
 * - The property must be a valid URL.
 * - The URL must use the `http` or `https` protocol.
 * - Includes a custom validation message if the value is not a valid URL.
 *
 * Example value:
 * - `https://example.com/question-cover-image.png`
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuizImageCoverProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
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
