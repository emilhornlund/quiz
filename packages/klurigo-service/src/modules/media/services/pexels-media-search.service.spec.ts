import { HttpService } from '@nestjs/axios'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { of } from 'rxjs'

import { EnvironmentVariables } from '../../../app/config'

import { PexelsMediaSearchService } from './pexels-media-search.service'

type PexelsPaginatedPhotoResponse = {
  total_results: number
  photos: Array<{
    alt: string
    src: {
      large: string
      tiny: string
      [key: string]: string
    }
  }>
}

describe('PexelsMediaSearchService', () => {
  let service: PexelsMediaSearchService

  let httpService: { get: jest.Mock }
  let configService: { get: jest.Mock }
  let logger: { log: jest.Mock }

  beforeEach(() => {
    httpService = { get: jest.fn() }
    configService = { get: jest.fn() }
    logger = { log: jest.fn() }

    service = new PexelsMediaSearchService(
      httpService as unknown as HttpService,
      configService as unknown as ConfigService<EnvironmentVariables>,
      logger as unknown as Logger,
    )
  })

  it('logs the search parameters', async () => {
    configService.get.mockReturnValue('pexels-key')
    httpService.get.mockReturnValue(
      of({
        data: {
          total_results: 0,
          photos: [],
        } satisfies PexelsPaginatedPhotoResponse,
      }),
    )

    await service.searchPhotos('cats', 10, 0)

    expect(logger.log).toHaveBeenCalledWith(
      'Searching for photos on Pexels API by `cats`, limit: `10`, offset: `0`.',
    )
  })

  it('uses defaults when limit/offset are not provided', async () => {
    configService.get.mockReturnValue('pexels-key')
    httpService.get.mockReturnValue(
      of({
        data: {
          total_results: 0,
          photos: [],
        } satisfies PexelsPaginatedPhotoResponse,
      }),
    )

    await service.searchPhotos('cats')

    expect(httpService.get).toHaveBeenCalledTimes(1)
    expect(httpService.get.mock.calls[0][0]).toContain('per_page=10')
    expect(httpService.get.mock.calls[0][0]).toContain('page=1')
  })

  it('builds the correct Pexels URL with calculated page (offset/limit)', async () => {
    configService.get.mockReturnValue('pexels-key')
    httpService.get.mockReturnValue(
      of({
        data: {
          total_results: 0,
          photos: [],
        } satisfies PexelsPaginatedPhotoResponse,
      }),
    )

    await service.searchPhotos('mountains', 10, 30) // page = floor(30/10)+1 = 4

    expect(httpService.get).toHaveBeenCalledWith(
      'https://api.pexels.com/v1/search?query=mountains&size=large&page=4&per_page=10',
      {
        headers: { Authorization: 'pexels-key' },
      },
    )
  })

  it('clamps page to at least 1 (even if offset is negative)', async () => {
    configService.get.mockReturnValue('pexels-key')
    httpService.get.mockReturnValue(
      of({
        data: {
          total_results: 0,
          photos: [],
        } satisfies PexelsPaginatedPhotoResponse,
      }),
    )

    await service.searchPhotos('ocean', 10, -999)

    expect(httpService.get.mock.calls[0][0]).toContain('page=1')
  })

  it('maps the API response into PaginatedMediaPhotoSearchDto', async () => {
    configService.get.mockReturnValue('pexels-key')

    const apiResponse: PexelsPaginatedPhotoResponse = {
      total_results: 123,
      photos: [
        {
          alt: 'A nice photo',
          src: {
            large: 'https://img.example/large.jpg',
            tiny: 'https://img.example/tiny.jpg',
          },
        },
        {
          alt: 'Another photo',
          src: {
            large: 'https://img.example/large2.jpg',
            tiny: 'https://img.example/tiny2.jpg',
          },
        },
      ],
    }

    httpService.get.mockReturnValue(of({ data: apiResponse }))

    const result = await service.searchPhotos('test', 20, 40)

    expect(result).toEqual({
      photos: [
        {
          photoURL: 'https://img.example/large.jpg',
          thumbnailURL: 'https://img.example/tiny.jpg',
          alt: 'A nice photo',
        },
        {
          photoURL: 'https://img.example/large2.jpg',
          thumbnailURL: 'https://img.example/tiny2.jpg',
          alt: 'Another photo',
        },
      ],
      total: 123,
      limit: 20,
      offset: 40,
    })
  })

  it('uses the PEXELS_API_KEY from ConfigService as Authorization header', async () => {
    configService.get.mockReturnValue('pexels-key-123')
    httpService.get.mockReturnValue(
      of({
        data: {
          total_results: 0,
          photos: [],
        } satisfies PexelsPaginatedPhotoResponse,
      }),
    )

    await service.searchPhotos('birds', 5, 0)

    expect(configService.get).toHaveBeenCalledWith('PEXELS_API_KEY')
    expect(httpService.get.mock.calls[0][1]).toEqual({
      headers: { Authorization: 'pexels-key-123' },
    })
  })
})
