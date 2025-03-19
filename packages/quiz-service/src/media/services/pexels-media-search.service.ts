import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PaginatedMediaPhotoSearchDto } from '@quiz/common'
import { firstValueFrom } from 'rxjs'

import { EnvironmentVariables } from '../../app/config'

import { PexelsPaginatedPhotoResponse } from './models'

/**
 * Service for searching and retrieving media photos from Pexels.
 */
@Injectable()
export class PexelsMediaSearchService {
  /**
   * Initializes the PexelsMediaSearchService.
   *
   * @param httpService - HTTP service for making API requests.
   * @param configService - Configuration service for retrieving API keys.
   * @param logger - Logger instance for debugging.
   */
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly logger: Logger = new Logger(PexelsMediaSearchService.name),
  ) {}

  /**
   * Searches photos on Pexels API based on the given search term and pagination parameters.
   *
   * @param search - The search query to filter photos.
   * @param limit - The number of photos per page (default: 10).
   * @param offset - The number of photos to skip before retrieving results.
   *
   * @returns A paginated response containing the search results.
   */
  public async searchPhotos(
    search?: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<PaginatedMediaPhotoSearchDto> {
    this.logger.log(
      `Searching for photos on Pexels API by \`${search}\`, limit: \`${limit}\`, offset: \`${offset}\`.`,
    )

    const page = Math.max(1, Math.floor(offset / limit) + 1)

    const { data } = await firstValueFrom(
      this.httpService.get<PexelsPaginatedPhotoResponse>(
        `https://api.pexels.com/v1/search?query=${search}&size=large&page=${page}&per_page=${limit}`,
        {
          headers: {
            Authorization: this.configService.get<string>('PEXELS_API_KEY'),
          },
        },
      ),
    )

    return {
      photos: data.photos.map(({ src, alt }) => ({
        photoURL: src['large'],
        thumbnailURL: src['tiny'],
        alt,
      })),
      total: data.total_results,
      limit,
      offset,
    }
  }
}
