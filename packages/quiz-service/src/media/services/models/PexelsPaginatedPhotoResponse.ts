/**
 * description here.
 */
export interface PexelsPaginatedPhotoResponse {
  photos: {
    src: Record<string, string>
    alt: string
  }[]
  total_results: number
}
