import { ApiProperty } from '@nestjs/swagger'
import { MediaPhotoSearchDto, PaginatedMediaPhotoSearchDto } from '@quiz/common'
import { IsArray, IsNumber, IsString, IsUrl, Max, Min } from 'class-validator'

/**
 * description here
 */
export class MediaPhotoSearchResponse implements MediaPhotoSearchDto {
  /**
   * The URL of the full-sized photo.
   */
  @ApiProperty({
    title: 'Photo URL',
    description: 'The URL of the full-sized photo.',
    example: 'https://example.com/photos/full-size.jpg',
  })
  @IsUrl({}, { message: 'photoURL must be a valid URL.' })
  photoURL: string

  /**
   * The URL of the thumbnail version of the photo.
   */
  @ApiProperty({
    title: 'Thumbnail URL',
    description: 'The URL of the thumbnail version of the photo.',
    example: 'https://example.com/photos/thumbnail.jpg',
  })
  @IsUrl({}, { message: 'thumbnailURL must be a valid URL.' })
  thumbnailURL: string

  /**
   * A description or alternative text for the photo.
   */
  @ApiProperty({
    title: 'Alt',
    description: 'A description or alternative text for the photo.',
    example: 'A scenic mountain landscape.',
  })
  @IsString({ message: 'alt must be a string.' })
  alt: string
}

/**
 * description here
 */
export class PaginatedMediaPhotoSearchResponse
  implements PaginatedMediaPhotoSearchDto
{
  /**
   * The list of photos for the current page.
   */
  @ApiProperty({
    title: 'Photos',
    description: 'The list of results for the current page.',
    type: [MediaPhotoSearchResponse],
    required: true,
  })
  @IsArray()
  photos: MediaPhotoSearchResponse[]

  /**
   * The total number of photos available.
   */
  @ApiProperty({
    title: 'Total',
    description: 'The total number of results available.',
    type: Number,
    minimum: 0,
    required: true,
    example: 10,
  })
  @IsNumber()
  @Min(0)
  total: number

  /**
   * The maximum number of photos returned per page.
   */
  @ApiProperty({
    title: 'Limit',
    description: 'The maximum number of results returned per page.',
    type: Number,
    required: true,
    minimum: 0,
    maximum: 50,
    example: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(50)
  limit: number

  /**
   * The offset from the start of the total photos.
   */
  @ApiProperty({
    title: 'Offset',
    description: 'The offset from the start of the total results.',
    type: Number,
    minimum: 0,
    required: true,
    example: 0,
  })
  @IsNumber()
  @Min(0)
  offset: number
}
