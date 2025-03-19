import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { Public } from '../../auth/decorators'
import { MediaService } from '../services'

import { ApiMediaPhotoSearchPageFilter } from './decorators/api'
import { PaginatedMediaPhotoSearchResponse } from './models'

/**
 * Controller for managing quiz-related operations.
 */
@ApiBearerAuth()
@ApiTags('media')
@Controller('media')
export class MediaController {
  /**
   * Initializes the MediaController.
   *
   * @param {MediaService} mediaService - Service for managing media operations.
   */
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Searches for photos based on query parameters.
   *
   * @param filter - The search and pagination parameters.
   *
   * @returns A paginated list of photos matching the search criteria.
   */
  @Public()
  @Get('/photos')
  @ApiOperation({
    summary: 'Search for media photos',
    description:
      'Retrieves photos based on the provided search term and pagination parameters.',
  })
  @ApiOkResponse({
    description: 'A paginated response containing media photos.',
    type: PaginatedMediaPhotoSearchResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @HttpCode(HttpStatus.OK)
  public searchMedia(
    @Query(new ValidationPipe({ transform: true }))
    filter: ApiMediaPhotoSearchPageFilter,
  ): Promise<PaginatedMediaPhotoSearchResponse> {
    return this.mediaService.searchPhotos(
      filter.search,
      filter.limit,
      filter.offset,
    )
  }
}
