import { access, constants, rm } from 'fs/promises'
import { join } from 'path'

import { PaginatedMediaPhotoSearchDto } from '@klurigo/common'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { Cacheable } from '../../../app/cache'
import { EnvironmentVariables } from '../../../app/config'
import { UploadedPhotoNotFoundException } from '../exceptions'

import { PexelsMediaSearchService } from './pexels-media-search.service'

const CACHE_PHOTOS_TTL = 60 * 60 // 1h in seconds

/**
 * Service for managing media-related operations.
 */
@Injectable()
export class MediaService {
  /**
   * Initializes the MediaService.
   *
   * @param cacheManager - The cache manager used for caching responses.
   * @param configService - Service to access environment variables.
   * @param pexelsMediaSearchService - The service for fetching photos from the Pexels API.
   * @param logger - Logger instance for debugging and monitoring.
   */
  constructor(
    @Inject(CACHE_MANAGER) public readonly cacheManager: Cache,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly pexelsMediaSearchService: PexelsMediaSearchService,
    private readonly logger: Logger = new Logger(MediaService.name),
  ) {}

  /**
   * Searches for photos (right now only using the Pexels API).
   *
   * @param search - The search term for filtering photos.
   * @param limit - The number of photos to return per page.
   * @param offset - The number of photos to skip before retrieving results.
   *
   * @returns A paginated response containing the search results.
   */
  @Cacheable(CACHE_PHOTOS_TTL)
  public async searchPhotos(
    search?: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<PaginatedMediaPhotoSearchDto> {
    this.logger.log(
      `Searching for photos by \`${search}\`, limit: \`${limit}\`, offset: \`${offset}\`.`,
    )
    return this.pexelsMediaSearchService.searchPhotos(search, limit, offset)
  }

  /**
   * Deletes the uploaded photo file belonging to the given user.
   *
   * @param photoId - The ID of the photo to delete (without file extension).
   * @param userId - The ID of the user who owns the photo.
   *
   * @throws UploadedPhotoNotFoundException if the file does not exist.
   */
  public async deleteUploadPhoto(
    photoId: string,
    userId: string,
  ): Promise<void> {
    const uploadDirectory = this.configService.get<string>('UPLOAD_DIRECTORY')
    if (!uploadDirectory) {
      throw new Error('Upload directory not found.')
    }
    const filePath = join(uploadDirectory, `${userId}/${photoId}.webp`)

    if (!(await MediaService.fileExists(filePath))) {
      throw new UploadedPhotoNotFoundException(photoId)
    }

    await rm(filePath)
  }

  /**
   * Checks if the given file exists.
   *
   * @param filePath - The full path to the file to check.
   * @returns True if the file exists, false otherwise.
   *
   * @private
   */
  private static async fileExists(filePath: string): Promise<boolean> {
    try {
      await access(filePath, constants.F_OK)
      return true
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (unused) {
      return false
    }
  }
}
