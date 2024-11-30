import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsUrl } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `url` property in media.
 *
 * This decorator applies validation and API documentation to the media URL field.
 * It ensures that the property:
 * - Is required.
 * - Is a valid URL string.
 *
 * Example usage:
 * ```typescript
 * import { ApiQuestionMediaUrlProperty } from './decorators';
 *
 * export class QuestionMediaRequest {
 *   @ApiQuestionMediaUrlProperty()
 *   url: string;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to include metadata in the OpenAPI documentation.
 * - `@IsUrl` to enforce the value must be a valid URL string.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuestionMediaUrlProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description: 'The URL of the media. Must be a valid URL.',
      example: 'https://example.com/question-image.png',
      required: true,
      format: 'url',
      type: String,
    }),
    IsUrl({}, { message: 'The media URL must be a valid URL.' }),
  )
}
