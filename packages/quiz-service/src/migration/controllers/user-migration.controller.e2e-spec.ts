import { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import supertest from 'supertest'

import {
  buildMockNoneMigratedPlayerUser,
  MOCK_SECONDARY_USER_EMAIL,
} from '../../../test-utils/data'
import {
  closeTestApp,
  createDefaultUserAndAuthenticate,
  createTestApp,
} from '../../../test-utils/utils'
import { LocalUser, User, UserModel } from '../../user/repositories'

describe('UserMigrationController (e2e)', () => {
  let app: INestApplication
  let userModel: UserModel

  beforeEach(async () => {
    app = await createTestApp()
    userModel = app.get<UserModel>(getModelToken(User.name))
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

  describe('/api/migration/user (POST)', () => {
    it('should successfully link a legacy anonymous player to the authenticated user', async () => {
      const { accessToken } = await createDefaultUserAndAuthenticate(app, {
        unverifiedEmail: MOCK_SECONDARY_USER_EMAIL,
      } as Partial<LocalUser>)

      const { migrationTokens } = await userModel.create(
        buildMockNoneMigratedPlayerUser(),
      )
      const migrationToken = migrationTokens[0]

      return supertest(app.getHttpServer())
        .post('/api/migration/user')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ migrationToken })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should return 400 bad request for invalid migration token', async () => {
      const { accessToken } = await createDefaultUserAndAuthenticate(app, {
        unverifiedEmail: MOCK_SECONDARY_USER_EMAIL,
      } as Partial<LocalUser>)

      return supertest(app.getHttpServer())
        .post('/api/migration/user')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ migrationToken: 'n/a' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            status: 400,
            timestamp: expect.anything(),
            validationErrors: [
              {
                constraints: {
                  matches:
                    'migrationToken must be a 43-character base64url string (A–Z, a–z, 0–9, _ or -).',
                  minLength:
                    'migrationToken must be longer than or equal to 43 characters',
                },
                property: 'migrationToken',
              },
            ],
          })
        })
    })

    it('should return 401 unauthorized when missing authorization', async () => {
      return supertest(app.getHttpServer())
        .get('/api/profile/user')
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Missing Authorization header',
            status: 401,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return 404 when an migration token is not found', async () => {
      const { accessToken } = await createDefaultUserAndAuthenticate(app, {
        unverifiedEmail: MOCK_SECONDARY_USER_EMAIL,
      } as Partial<LocalUser>)

      return supertest(app.getHttpServer())
        .post('/api/migration/user')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ migrationToken: 'jU4n2n9eC-8GEZhk8NcApcfNQF9xO0yQOeJUZQk4w-E' })
        .expect(404)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'User was not found by migration token',
            status: 404,
            timestamp: expect.anything(),
          })
        })
    })
  })
})
