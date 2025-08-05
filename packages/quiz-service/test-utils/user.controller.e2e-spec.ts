import { INestApplication } from '@nestjs/common'
import supertest from 'supertest'

import { UserRepository } from '../src/user/services'

import {
  MOCK_DEFAULT_PLAYER_NICKNAME,
  MOCK_DEFAULT_USER_EMAIL,
  MOCK_DEFAULT_USER_FAMILY_NAME,
  MOCK_DEFAULT_USER_GIVEN_NAME,
  MOCK_DEFAULT_USER_HASHED_PASSWORD,
  MOCK_DEFAULT_USER_PASSWORD,
} from './data'
import { closeTestApp, createTestApp } from './utils/bootstrap'

describe('UserController (e2e)', () => {
  let app: INestApplication
  let userRepository: UserRepository

  beforeEach(async () => {
    app = await createTestApp()
    userRepository = app.get<UserRepository>(UserRepository)
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

  describe('/api/users (POST)', () => {
    it('should succeed in creating a new user', async () => {
      return supertest(app.getHttpServer())
        .post(`/api/users`)
        .send({
          email: MOCK_DEFAULT_USER_EMAIL,
          password: MOCK_DEFAULT_USER_PASSWORD,
          givenName: MOCK_DEFAULT_USER_GIVEN_NAME,
          familyName: MOCK_DEFAULT_USER_FAMILY_NAME,
          defaultNickname: MOCK_DEFAULT_PLAYER_NICKNAME,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({
            id: expect.any(String),
            email: MOCK_DEFAULT_USER_EMAIL,
            givenName: MOCK_DEFAULT_USER_GIVEN_NAME,
            familyName: MOCK_DEFAULT_USER_FAMILY_NAME,
            defaultNickname: MOCK_DEFAULT_PLAYER_NICKNAME,
            created: expect.any(String),
            updated: expect.any(String),
          })
        })
    })

    it('should return 400 bad request error when failing validation', async () => {
      return supertest(app.getHttpServer())
        .post(`/api/users`)
        .send({
          givenName: '#',
          familyName: '#',
          defaultNickname: '#',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            status: 400,
            timestamp: expect.any(String),
            validationErrors: [
              {
                constraints: {
                  matches: 'Email must be a valid address.',
                  maxLength:
                    'email must be shorter than or equal to 128 characters',
                  minLength:
                    'email must be longer than or equal to 6 characters',
                },
                property: 'email',
              },
              {
                constraints: {
                  matches:
                    'Password must include ≥2 uppercase, ≥2 lowercase, ≥2 digits, ≥2 symbols.',
                  maxLength:
                    'password must be shorter than or equal to 128 characters',
                  minLength:
                    'password must be longer than or equal to 8 characters',
                },
                property: 'password',
              },
              {
                constraints: {
                  matches:
                    'Given name must be 1–64 characters of letters/marks, and may include internal spaces, apostrophes or hyphens (no leading/trailing separators).',
                },
                property: 'givenName',
              },
              {
                constraints: {
                  matches:
                    'Family name must be 1–64 characters of letters/marks, and may include internal spaces, apostrophes or hyphens (no leading/trailing separators).',
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

    it('should return 409 conflict error when user already exists', async () => {
      await userRepository.createLocalUser({
        email: MOCK_DEFAULT_USER_EMAIL,
        hashedPassword: MOCK_DEFAULT_USER_HASHED_PASSWORD,
        givenName: MOCK_DEFAULT_USER_GIVEN_NAME,
        familyName: MOCK_DEFAULT_USER_FAMILY_NAME,
        defaultNickname: MOCK_DEFAULT_PLAYER_NICKNAME,
      })

      return supertest(app.getHttpServer())
        .post(`/api/users`)
        .send({
          email: MOCK_DEFAULT_USER_EMAIL,
          password: MOCK_DEFAULT_USER_PASSWORD,
          givenName: MOCK_DEFAULT_USER_GIVEN_NAME,
          familyName: MOCK_DEFAULT_USER_FAMILY_NAME,
          defaultNickname: MOCK_DEFAULT_PLAYER_NICKNAME,
        })
        .expect(409)
        .expect((res) => {
          expect(res.body).toEqual({
            message: `Email '${MOCK_DEFAULT_USER_EMAIL}' is not unique`,
            status: 409,
            timestamp: expect.any(String),
          })
        })
    })
  })
})
