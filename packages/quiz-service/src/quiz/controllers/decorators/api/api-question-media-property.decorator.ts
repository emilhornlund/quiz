import { applyDecorators } from '@nestjs/common'
import { BadRequestException } from '@nestjs/common'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { MediaType } from '@quiz/common'
import { ClassConstructor, plainToInstance, Transform } from 'class-transformer'
import { IsObject, IsOptional, ValidateNested } from 'class-validator'

/**
 * Object containing factory functions for media class constructors.
 */
type MediaFactories = {
  image: () => ClassConstructor<unknown>
  audio: () => ClassConstructor<unknown>
  video: () => ClassConstructor<unknown>
}

/**
 * Transforms a raw media object into its corresponding class instance
 * based on the provided `type` field.
 *
 * @param v - The raw media object to transform.
 * @param factories - The mapping of media type factories.
 * @throws {BadRequestException} If the provided type is invalid.
 */
function transformMediaByType(
  v: unknown,
  { image, audio, video }: MediaFactories,
) {
  // Allow undefined/null because the property is optional
  if (v === null || v === undefined) return undefined
  const value = v as { type?: MediaType }

  switch (value?.type) {
    case MediaType.Image:
      return plainToInstance(image(), value)
    case MediaType.Audio:
      return plainToInstance(audio(), value)
    case MediaType.Video:
      return plainToInstance(video(), value)
    default:
      throw new BadRequestException('Invalid media payload: unknown type')
  }
}

/**
 * Decorator for documenting and validating the optional `media` property.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation (oneOf with discriminator).
 * - `@IsObject`, `@IsOptional`, `@ValidateNested` for validation.
 * - `@Transform` to instantiate the correct media subclass based on `type`.
 */
export function ApiQuestionMediaProperty(
  factories: MediaFactories,
): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Media',
      description:
        'Optional media (image, audio, or video) associated with the question.',
      required: false,
      oneOf: [
        { $ref: getSchemaPath(factories.image()) },
        { $ref: getSchemaPath(factories.audio()) },
        { $ref: getSchemaPath(factories.video()) },
      ],
      discriminator: {
        propertyName: 'type',
        mapping: {
          [MediaType.Image]: getSchemaPath(factories.image()),
          [MediaType.Audio]: getSchemaPath(factories.audio()),
          [MediaType.Video]: getSchemaPath(factories.video()),
        },
      },
    }),
    IsObject(),
    IsOptional(),
    ValidateNested(),
    Transform(
      ({ value }) =>
        transformMediaByType(value == null ? undefined : value, factories),
      {
        toClassOnly: true,
      },
    ),
  )
}
