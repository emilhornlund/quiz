import { applyDecorators } from '@nestjs/common'
import { ApiParam } from '@nestjs/swagger'

/**
 * Decorator for Swagger documentation of the `photoId` route parameter.
 *
 * Usage:
 * ```typescript
 * @Put(':photoId')
 * @ApiUploadedPhotoIdParam()
 * public async deleteUploadedPhoto(
 *   @RouteUploadedPhotoIdParam() photoId: string,
 * ): Promise<void> {
 *   // Your logic here
 * }
 * ```
 *
 * @returns {MethodDecorator} The Swagger API parameter decorator.
 */
export function ApiUploadedPhotoIdParam(): MethodDecorator {
  return applyDecorators(
    ApiParam({
      name: 'photoId',
      description: 'The unique identifier of the uploaded photo.',
      required: true,
      type: String,
      format: 'uuid',
      example: 'eaf37189-7aa7-455e-9e47-73db2a7d0a03',
    }),
  )
}
