import { INestApplication } from '@nestjs/common'
import { getConnectionToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { getRedisConnectionToken } from '@nestjs-modules/ioredis'
import { Redis } from 'ioredis'
import { Connection } from 'mongoose'

import { AppModule } from '../../src/app'
import { configureApp } from '../../src/app/utils'
import { PexelsMediaSearchService } from '../../src/media/services'

const mockPexelsMediaSearchService = {
  searchPhotos: async () =>
    Promise.resolve({
      photos: [
        {
          photoURL:
            'https://images.pexels.com/photos/247599/pexels-photo-247599.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
          thumbnailURL:
            'https://images.pexels.com/photos/247599/pexels-photo-247599.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280',
          alt: 'Lush green terraced rice fields with a rustic hut under soft sunlight.',
        },
      ],
      total: 1,
      limit: 10,
      offset: 0,
    }),
}

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PexelsMediaSearchService)
    .useValue(mockPexelsMediaSearchService)
    .compile()

  const app = moduleFixture.createNestApplication()
  configureApp(app)
  await app.init()

  return app
}

export async function closeTestApp(app: INestApplication): Promise<void> {
  const connection = app.get(getConnectionToken()) as Connection
  const collections = await connection.listCollections()
  await Promise.all(
    collections.map(({ name }) => connection.dropCollection(name)),
  )

  const redis = app.get<Redis>(getRedisConnectionToken())
  await redis.flushdb()

  await app.close()
}
