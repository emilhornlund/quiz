import { Param, ParseUUIDPipe } from '@nestjs/common'

/**
 * Decorator for validating and extracting the `photoId` route parameter.
 *
 * This decorator ensures that the `photoId` is a valid UUID and makes it available
 * as a parameter in the request handler.
 *
 * Usage:
 * ```typescript
 * @Get(':photoId')
 * public async deleteUploadedPhoto(@RouteUploadedPhotoIdParam() photoId: string): Promise<void> {
 *   // Your logic here
 * }
 * ```
 *
 * @returns {ParameterDecorator} The parameter decorator for `photoId`.
 */
export function RouteUploadedPhotoIdParam(): ParameterDecorator {
  return Param('photoId', new ParseUUIDPipe())
}
