import { NotFoundException } from '@nestjs/common'

/**
 * Exception thrown when an uploaded photo is not found by its ID.
 */
export class UploadedPhotoNotFoundException extends NotFoundException {
  /**
   * Initializes the `UploadedPhotoNotFoundException`.
   *
   * @param {string} photoId - The unique identifier of the uploaded photo that was not found.
   */
  constructor(photoId: string) {
    super(`Uploaded photo was not found by ID '${photoId}'`)
  }
}
