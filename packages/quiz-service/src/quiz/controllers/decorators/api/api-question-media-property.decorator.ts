import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsObject, IsOptional, ValidateNested } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `media` property.
 *
 * This decorator applies validation and API documentation to the media field associated with a question.
 * It ensures that the property:
 * - Is optional.
 * - Is an object containing details about the media.
 *
 * Example usage:
 * ```typescript
 * import { ApiQuestionMediaProperty } from './decorators';
 *
 * export class QuestionDto {
 *   @ApiQuestionMediaProperty()
 *   media?: QuestionMediaRequest;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to include metadata in the OpenAPI documentation.
 * - `@IsObject` to enforce the value must be an object.
 * - `@IsOptional` to mark the field as optional.
 * - `@ValidateNested` to validate nested fields in the media object.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuestionMediaProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description:
        'Optional media (image, audio, or video) associated with the question.',
      required: false,
      // type: () => QuestionMediaRequest,
    }),
    IsObject(),
    IsOptional(),
    ValidateNested(),
    // Type(() => QuestionMediaRequest),
  )
}
