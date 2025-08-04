import { INestApplication, UnauthorizedException } from '@nestjs/common'
import { getConnectionToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { getRedisConnectionToken } from '@nestjs-modules/ioredis'
import { Redis } from 'ioredis'
import { Connection } from 'mongoose'

import { AppModule } from '../../src/app'
import { configureApp } from '../../src/app/utils'
import { GoogleAuthService } from '../../src/auth/services'
import { GoogleProfileDto } from '../../src/auth/services/models'
import { PexelsMediaSearchService } from '../../src/media/services'
import { MOCK_PRIMARY_GOOGLE_USER_ID, MOCK_PRIMARY_USER_EMAIL } from '../data'
import {
  MOCK_GOOGLE_ACCESS_TOKEN_VALID,
  MOCK_GOOGLE_VALID_CODE,
  MOCK_GOOGLE_VALID_CODE_VERIFIER,
} from '../data/google-auth.data'

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

const mockGoogleAuthService = {
  exchangeCodeForAccessToken: async (
    code: string,
    codeVerifier: string,
  ): Promise<string> => {
    if (
      code === MOCK_GOOGLE_VALID_CODE &&
      codeVerifier === MOCK_GOOGLE_VALID_CODE_VERIFIER
    ) {
      return MOCK_GOOGLE_ACCESS_TOKEN_VALID
    }
    throw new UnauthorizedException(
      'Invalid authorization code or PKCE verifier.',
    )
  },
  fetchGoogleProfile: async (
    accessToken: string,
  ): Promise<GoogleProfileDto> => {
    if (accessToken === MOCK_GOOGLE_ACCESS_TOKEN_VALID) {
      return {
        id: MOCK_PRIMARY_GOOGLE_USER_ID,
        email: MOCK_PRIMARY_USER_EMAIL,
        verified_email: true,
        name: 'Jane Doe',
        given_name: 'Jane',
        family_name: 'Doe',
        picture: 'http://img',
      }
    }
    throw new UnauthorizedException('Access token is invalid or has expired.')
  },
}

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PexelsMediaSearchService)
    .useValue(mockPexelsMediaSearchService)
    .overrideProvider(GoogleAuthService)
    .useValue(mockGoogleAuthService)
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
