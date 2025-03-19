/**
 * Represents a photo with its associated URLs and alternative text.
 */
export interface MediaPhotoSearchDto {
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
 * Represents a paginated response for media photo searches.
 */
export interface PaginatedMediaPhotoSearchDto {
  /**
   * The list of photos for the current page.
   */
  photos: MediaPhotoSearchDto[]

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
