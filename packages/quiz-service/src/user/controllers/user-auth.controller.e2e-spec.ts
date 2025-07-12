import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Authority, TokenScope } from '@quiz/common'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import {
  MOCK_DEFAULT_HASHED_PASSWORD,
  MOCK_PRIMARY_USER_DEFAULT_NICKNAME,
  MOCK_PRIMARY_USER_EMAIL,
  MOCK_PRIMARY_USER_FAMILY_NAME,
  MOCK_PRIMARY_USER_GIVEN_NAME,
  MOCK_SECONDARY_USER_EMAIL,
} from '../../../test-utils/data'
import {
  closeTestApp,
  createDefaultUserAndAuthenticate,
  createTestApp,
} from '../../../test-utils/utils'
import { AuthService } from '../../auth/services'
import { LocalUser, UserRepository } from '../repositories'

describe('UserAuthController (e2e)', () => {
  let app: INestApplication
  let userRepository: UserRepository
  let authService: AuthService
  let jwtService: JwtService

  beforeEach(async () => {
    app = await createTestApp()
    userRepository = app.get<UserRepository>(UserRepository)
    authService = app.get<AuthService>(AuthService)
    jwtService = app.get(JwtService)
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

  describe('/api/auth/email/verify (POST)', () => {
    it('should verify a user email successfully', async () => {
      const { _id: userId, email } = await userRepository.createLocalUser({
        email: MOCK_PRIMARY_USER_EMAIL,
        unverifiedEmail: MOCK_PRIMARY_USER_EMAIL,
        hashedPassword: MOCK_DEFAULT_HASHED_PASSWORD,
        givenName: MOCK_PRIMARY_USER_GIVEN_NAME,
        familyName: MOCK_PRIMARY_USER_FAMILY_NAME,
        defaultNickname: MOCK_PRIMARY_USER_DEFAULT_NICKNAME,
      })

      const accessToken = await authService.signVerifyEmailToken(userId, email)

      return supertest(app.getHttpServer())
        .post('/api/auth/email/verify')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send()
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should return 400 when email does not match the unverified email', async () => {
      const { _id: userId } = await userRepository.createLocalUser({
        email: MOCK_PRIMARY_USER_EMAIL,
        unverifiedEmail: MOCK_PRIMARY_USER_EMAIL,
        hashedPassword: MOCK_DEFAULT_HASHED_PASSWORD,
        givenName: MOCK_PRIMARY_USER_GIVEN_NAME,
        familyName: MOCK_PRIMARY_USER_FAMILY_NAME,
        defaultNickname: MOCK_PRIMARY_USER_DEFAULT_NICKNAME,
      })

      const accessToken = await authService.signVerifyEmailToken(
        userId,
        MOCK_SECONDARY_USER_EMAIL,
      )

      return supertest(app.getHttpServer())
        .post('/api/auth/email/verify')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send()
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Email does not match',
            status: 400,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return 401 when the authorization has expired', async () => {
      const { _id: userId, email } = await userRepository.createLocalUser({
        email: MOCK_PRIMARY_USER_EMAIL,
        unverifiedEmail: MOCK_PRIMARY_USER_EMAIL,
        hashedPassword: MOCK_DEFAULT_HASHED_PASSWORD,
        givenName: MOCK_PRIMARY_USER_GIVEN_NAME,
        familyName: MOCK_PRIMARY_USER_FAMILY_NAME,
        defaultNickname: MOCK_PRIMARY_USER_DEFAULT_NICKNAME,
      })

      const accessToken = await jwtService.signAsync(
        {
          scope: TokenScope.User,
          authorities: [Authority.VerifyEmail],
          email,
        },
        {
          jwtid: uuidv4(),
          subject: userId,
          expiresIn: '-1d',
        },
      )

      return supertest(app.getHttpServer())
        .post('/api/auth/email/verify')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send()
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Invalid or expired token',
            status: 401,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return 401 when malformed authorization', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/email/verify')
        .set({ Authorization: 'Bearer garbage' })
        .send()
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Invalid or expired token',
            status: 401,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return 401 when missing authorization header', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/email/verify')
        .send()
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Missing Authorization header',
            status: 401,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return 403 when missing required authority', async () => {
      const { accessToken } = await createDefaultUserAndAuthenticate(app, {
        unverifiedEmail: MOCK_PRIMARY_USER_EMAIL,
      } as Partial<LocalUser>)

      return supertest(app.getHttpServer())
        .post('/api/auth/email/verify')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send()
        .expect(403)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Insufficient authorities',
            status: 403,
            timestamp: expect.anything(),
          })
        })
    })
  })

  describe('/api/auth/email/resend_verification (POST)', () => {
    it('should resend the verification email successfully', async () => {
      const { accessToken } = await createDefaultUserAndAuthenticate(app, {
        unverifiedEmail: MOCK_PRIMARY_USER_EMAIL,
      } as Partial<LocalUser>)

      return supertest(app.getHttpServer())
        .post('/api/auth/email/resend_verification')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send()
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should return 401 when missing authorization header', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/email/resend_verification')
        .send()
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
