import { MediaPhotoSearchDto, PaginatedMediaPhotoSearchDto } from '@quiz/common'

/**
 * description here
 */
export class MediaPhotoSearchResponse implements MediaPhotoSearchDto {
  /**
   * The URL of the full-sized photo.
   */
  photoURL: string

  /**
   * The URL of the thumbnail version of the photo.
   */
  thumbnailURL: string

  /**
   * A description or alternative text for the photo.
   */
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
  photos: MediaPhotoSearchResponse[]

  /**
   * The total number of photos available.
   */
  total: number

  /**
   * The maximum number of photos returned per page.
   */
  limit: number

  /**
   * The offset from the start of the total photos.
   */
  offset: number
}
