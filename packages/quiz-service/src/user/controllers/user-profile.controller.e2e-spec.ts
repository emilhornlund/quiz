import { INestApplication } from '@nestjs/common'
import { AuthProvider } from '@quiz/common'
import supertest from 'supertest'

import {
  MOCK_PRIMARY_USER_DEFAULT_NICKNAME,
  MOCK_PRIMARY_USER_EMAIL,
  MOCK_PRIMARY_USER_FAMILY_NAME,
  MOCK_PRIMARY_USER_GIVEN_NAME,
  MOCK_SECONDARY_USER_DEFAULT_NICKNAME,
  MOCK_SECONDARY_USER_EMAIL,
  MOCK_SECONDARY_USER_FAMILY_NAME,
  MOCK_SECONDARY_USER_GIVEN_NAME,
} from '../../../test-utils/data'
import {
  closeTestApp,
  createDefaultUserAndAuthenticate,
  createTestApp,
} from '../../../test-utils/utils'

describe('UserProfileController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    app = await createTestApp()
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

  describe('/api/profile/user (GET)', () => {
    it('should succeed in retrieving the associated profile from a user', async () => {
      const { accessToken, user } = await createDefaultUserAndAuthenticate(app)

      return supertest(app.getHttpServer())
        .get('/api/profile/user')
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: user._id,
            email: MOCK_PRIMARY_USER_EMAIL,
            givenName: MOCK_PRIMARY_USER_GIVEN_NAME,
            familyName: MOCK_PRIMARY_USER_FAMILY_NAME,
            defaultNickname: MOCK_PRIMARY_USER_DEFAULT_NICKNAME,
            authProvider: AuthProvider.Local,
            created: expect.any(String),
            updated: expect.any(String),
          })
        })
    })

    it('should fail in retrieving the associated profile without authorization', async () => {
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
  })

  describe('/api/profile/user (PUT)', () => {
    it('should update all fields of the user successfully', async () => {
      const { accessToken, user } = await createDefaultUserAndAuthenticate(app)

      return supertest(app.getHttpServer())
        .put('/api/profile/user')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          email: MOCK_SECONDARY_USER_EMAIL,
          givenName: MOCK_SECONDARY_USER_GIVEN_NAME,
          familyName: MOCK_SECONDARY_USER_FAMILY_NAME,
          defaultNickname: MOCK_SECONDARY_USER_DEFAULT_NICKNAME,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: user._id,
            email: MOCK_SECONDARY_USER_EMAIL,
            givenName: MOCK_SECONDARY_USER_GIVEN_NAME,
            familyName: MOCK_SECONDARY_USER_FAMILY_NAME,
            defaultNickname: MOCK_SECONDARY_USER_DEFAULT_NICKNAME,
            authProvider: AuthProvider.Local,
            created: expect.any(String),
            updated: expect.any(String),
          })
        })
    })

    it('should update the user’s nickname containing emojis successfully', async () => {
      const { accessToken, user } = await createDefaultUserAndAuthenticate(app)

      const defaultNickname = '🥶🐻'

      return supertest(app.getHttpServer())
        .put('/api/profile/user')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ defaultNickname })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: user._id,
            email: MOCK_PRIMARY_USER_EMAIL,
            givenName: MOCK_PRIMARY_USER_GIVEN_NAME,
            familyName: MOCK_PRIMARY_USER_FAMILY_NAME,
            defaultNickname,
            authProvider: AuthProvider.Local,
            created: expect.any(String),
            updated: expect.any(String),
          })
        })
    })

    it('should update the user with empty request body successfully', async () => {
      const { accessToken, user } = await createDefaultUserAndAuthenticate(app)

      return supertest(app.getHttpServer())
        .put('/api/profile/user')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({})
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: user._id,
            email: MOCK_PRIMARY_USER_EMAIL,
            givenName: MOCK_PRIMARY_USER_GIVEN_NAME,
            familyName: MOCK_PRIMARY_USER_FAMILY_NAME,
            defaultNickname: MOCK_PRIMARY_USER_DEFAULT_NICKNAME,
            authProvider: AuthProvider.Local,
            created: expect.any(String),
            updated: expect.any(String),
          })
        })
    })

    it('should return 400 bad request if validation fails', async () => {
      const { accessToken } = await createDefaultUserAndAuthenticate(app)

      return supertest(app.getHttpServer())
        .put('/api/profile/user')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          email: '',
          givenName: '',
          familyName: '',
          defaultNickname: '',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            status: 400,
            timestamp: expect.anything(),
            validationErrors: [
              {
                constraints: {
                  matches: 'Email must be a valid address.',
                  minLength:
                    'email must be longer than or equal to 6 characters',
                },
                property: 'email',
              },
              {
                constraints: {
                  matches:
                    'Given name must be 1–64 characters of letters/marks, and may include internal spaces, apostrophes or hyphens (no leading/trailing separators).',
                  minLength:
                    'givenName must be longer than or equal to 1 characters',
                },
                property: 'givenName',
              },
              {
                constraints: {
                  matches:
                    'Family name must be 1–64 characters of letters/marks, and may include internal spaces, apostrophes or hyphens (no leading/trailing separators).',
                  minLength:
                    'familyName must be longer than or equal to 1 characters',
                },
                property: 'familyName',
              },
              {
                constraints: {
                  matches:
                    'Nickname can only contain letters, numbers, and underscores.',
                  minLength:
                    'defaultNickname must be longer than or equal to 2 characters',
                },
                property: 'defaultNickname',
              },
            ],
          })
        })
    })

    it('should return 401 if user is unauthorized', async () => {
      return supertest(app.getHttpServer())
        .put('/api/profile/user')
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Missing Authorization header',
            status: 401,
            timestamp: expect.anything(),
          })
        })
    })
  })
})
