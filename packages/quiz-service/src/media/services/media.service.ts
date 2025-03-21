import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { PaginatedMediaPhotoSearchDto } from '@quiz/common'

import { Cacheable } from '../../app/cache'

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
   * @param pexelsMediaSearchService - The service for fetching photos from the Pexels API.
   * @param logger - Logger instance for debugging and monitoring.
   */
  constructor(
    @Inject(CACHE_MANAGER) public readonly cacheManager: Cache,
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
}
