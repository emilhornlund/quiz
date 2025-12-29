import { MediaUploadPhotoResponseDto } from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'

/**
 * Response returned after successfully uploading a media photo.
 */
export class MediaUploadPhotoResponse implements MediaUploadPhotoResponseDto {
  /**
   * The new filename of the uploaded image after processing and conversion.
   */
  @ApiProperty({
    title: 'Filename',
    description:
      'The new name of the uploaded image after resizing and converting to webp format.',
    type: String,
    example: 'ecd7a560-9225-4b07-9fdc-37b9fc078885.webp',
  })
  filename: string
}
