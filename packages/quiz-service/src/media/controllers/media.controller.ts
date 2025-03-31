import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'

import { ParseImageFilePipe } from '../pipes'
import { MediaService } from '../services'

import { ApiMediaPhotoSearchPageFilter } from './decorators/api'
import { PaginatedMediaPhotoSearchResponse } from './models'
import { MediaUploadPhotoResponse } from './models/media-upload-photo.response'

/**
 * Controller for managing media-related operations.
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
  @Get('/photos')
  @ApiOperation({
    summary: 'Search for photos',
    description:
      'Retrieves photos based on the provided search term and pagination parameters.',
  })
  @ApiOkResponse({
    description: 'A paginated response containing photos.',
    type: PaginatedMediaPhotoSearchResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @HttpCode(HttpStatus.OK)
  @Throttle({
    short: { limit: 1, ttl: 1000 },
    medium: { limit: 3, ttl: 10000 },
    long: { limit: 10, ttl: 60000 },
  })
  public searchPhotos(
    @Query(new ValidationPipe({ transform: true }))
    filter: ApiMediaPhotoSearchPageFilter,
  ): Promise<PaginatedMediaPhotoSearchResponse> {
    return this.mediaService.searchPhotos(
      filter.search,
      filter.limit,
      filter.offset,
    )
  }

  /**
   * Uploads a photo, validates the file type and size, processes it (resize and convert to webp),
   * and returns the generated filename.
   *
   * @param file - The uploaded image file, processed and saved as webp.
   *
   * @returns An object containing the new filename of the uploaded and processed image.
   */
  @Post('/photos')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a photo',
    description:
      'Uploads a single image file, validates and processes it (resize and convert to .webp), and returns the new filename.',
  })
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The image file to upload (jpeg, png, gif, tiff, webp)',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Successfully uploaded and processed the image.',
    type: MediaUploadPhotoResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @ApiUnprocessableEntityResponse({
    description: 'The uploaded file was invalid or could not be processed.',
  })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  public async uploadPhoto(
    @UploadedFile(ParseImageFilePipe) file: string,
  ): Promise<MediaUploadPhotoResponse> {
    return { filename: file }
  }
}
