import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { TypeHelpOptions } from 'class-transformer/types/interfaces'
import { IsObject, IsOptional, ValidateNested } from 'class-validator'

/**
 * Decorator for documenting and validating the optional `media` property of a question.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsObject` to validate that the value is an object.
 * - `@IsOptional` to mark the property as optional.
 * - `@ValidateNested` and `@Type` for class transformation and validation.
 */
export function ApiQuestionMediaProperty(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  options: { type?: (type?: TypeHelpOptions) => Function },
): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Media',
      description:
        'Optional media (image, audio, or video) associated with the question.',
      required: false,
      type: options.type,
    }),
    IsObject(),
    IsOptional(),
    ValidateNested(),
    Type(options.type),
  )
}
