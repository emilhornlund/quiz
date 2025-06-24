import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { TokenDto, TokenScope } from '@quiz/common'
import * as bcrypt from 'bcryptjs'
import { Response } from 'superagent'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import {
  MOCK_DEFAULT_USER_EMAIL,
  MOCK_DEFAULT_USER_FAMILY_NAME,
  MOCK_DEFAULT_USER_GIVEN_NAME,
  MOCK_DEFAULT_USER_HASHED_PASSWORD,
  MOCK_DEFAULT_USER_INVALID_PASSWORD,
  MOCK_DEFAULT_USER_PASSWORD,
} from '../../../test-utils/data'
import { closeTestApp, createTestApp } from '../../../test-utils/utils'
import { ClientService } from '../../client/services'
import { UserRepository } from '../../user/services'
import { AuthService } from '../services'
import {
  DEFAULT_REFRESH_AUTHORITIES,
  DEFAULT_USER_AUTHORITIES,
} from '../services/utils'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  let jwtService: JwtService
  let clientService: ClientService
  let userRepository: UserRepository
  let authService: AuthService

  beforeEach(async () => {
    app = await createTestApp()
    jwtService = app.get(JwtService)
    clientService = app.get(ClientService)
    userRepository = app.get<UserRepository>(UserRepository)
    authService = app.get<AuthService>(AuthService)
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

  describe('/api/login (POST)', () => {
    it('should succeed in authenticating a user', async () => {
      const user = await userRepository.createLocalUser({
        email: MOCK_DEFAULT_USER_EMAIL,
        hashedPassword: MOCK_DEFAULT_USER_HASHED_PASSWORD,
        givenName: MOCK_DEFAULT_USER_GIVEN_NAME,
        familyName: MOCK_DEFAULT_USER_FAMILY_NAME,
      })

      return supertest(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: MOCK_DEFAULT_USER_EMAIL,
          password: MOCK_DEFAULT_USER_PASSWORD,
        })
        .expect(200)
        .expect((res) => {
          expectAuthLoginRequestDto(user._id, res)
        })
    })

    it('should return 400 bad request when email not found', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: MOCK_DEFAULT_USER_EMAIL,
          password: MOCK_DEFAULT_USER_PASSWORD,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Bad credentials',
            status: 400,
            timestamp: expect.any(String),
          })
        })
    })

    it('should return 400 bad request when password is invalid', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: MOCK_DEFAULT_USER_EMAIL,
          password: MOCK_DEFAULT_USER_INVALID_PASSWORD,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Bad credentials',
            status: 400,
            timestamp: expect.any(String),
          })
        })
    })

    it('should return 400 bad request when validation fails', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/login')
        .send({})
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
            ],
          })
        })
    })
  })

  describe('/api/refresh (POST)', () => {
    it('should succeed in refresh an existing authentication', async () => {
      const user = await userRepository.createLocalUser({
        email: MOCK_DEFAULT_USER_EMAIL,
        hashedPassword: MOCK_DEFAULT_USER_HASHED_PASSWORD,
        givenName: MOCK_DEFAULT_USER_GIVEN_NAME,
        familyName: MOCK_DEFAULT_USER_FAMILY_NAME,
      })

      const { refreshToken } = await authService.login({
        email: MOCK_DEFAULT_USER_EMAIL,
        password: MOCK_DEFAULT_USER_PASSWORD,
      })

      return supertest(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expectAuthLoginRequestDto(user._id, res)
        })
    })

    it('should return 400 bad request when token has expired', async () => {
      const refreshToken = await jwtService.signAsync(
        { authorities: DEFAULT_REFRESH_AUTHORITIES },
        { subject: uuidv4(), expiresIn: '-1d' },
      )

      return supertest(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Unauthorized',
            status: 401,
            timestamp: expect.any(String),
          })
        })
    })

    it('should return 400 bad request when token is missing REFRESH_AUTH authority.', async () => {
      const refreshToken = await jwtService.signAsync(
        { authorities: [] },
        { subject: uuidv4(), expiresIn: '30d' },
      )

      return supertest(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Unauthorized',
            status: 401,
            timestamp: expect.any(String),
          })
        })
    })

    it('should return 400 bad request when validation fails', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid_jwt',
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
                  isJwt: 'refreshToken must be a jwt string',
                },
                property: 'refreshToken',
              },
            ],
          })
        })
    })
  })

  describe('/api/auth (POST)', () => {
    it('should succeed in authenticating a new client', () => {
      const clientId = uuidv4()

      return supertest(app.getHttpServer())
        .post('/api/auth')
        .send({ clientId })
        .expect(200)
        .expect((res) => {
          expectLegacyAuthResponseDto(res, clientId)
        })
    })

    it('should succeed in authenticating an existing client', async () => {
      const clientId = uuidv4()

      const {
        _id,
        player: { _id: playerId, nickname },
      } = await clientService.findOrCreateClient(clientId)

      expect(clientId).toEqual(_id)

      return supertest(app.getHttpServer())
        .post('/api/auth')
        .send({ clientId })
        .expect(200)
        .expect((res) => {
          expectLegacyAuthResponseDto(res, clientId, playerId, nickname)
        })
    })

    it('should fail in authenticating without a client id', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            status: 400,
            timestamp: expect.anything(),
            validationErrors: [
              {
                property: 'clientId',
                constraints: {
                  isNotEmpty: 'clientId should not be empty',
                  isUuid: 'clientId must be a UUID',
                },
              },
            ],
          })
        })
    })

    it('should fail in authenticating without a request body', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth')
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Missing request payload',
            status: 400,
            timestamp: expect.anything(),
          })
        })
    })

    it('should fail in authenticating with an invalid client id', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth')
        .send({ clientId: 'not-valid' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Validation failed')
          expect(res.body).toHaveProperty('status', 400)
          expect(res.body).toHaveProperty('timestamp')
          expect(res.body).toHaveProperty('validationErrors', [
            {
              property: 'clientId',
              constraints: {
                isUuid: 'clientId must be a UUID',
              },
            },
          ])
        })
    })
  })

  function expectAuthLoginRequestDto(userId: string, response: Response) {
    expect(response.body).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    })

    const accessTokenDto = jwtService.verify<TokenDto>(
      response.body.accessToken,
    )
    expect(accessTokenDto.sub).toEqual(userId)
    expect(accessTokenDto.scope).toEqual(TokenScope.User)
    expect(accessTokenDto.authorities).toEqual(DEFAULT_USER_AUTHORITIES)

    const refreshTokenDto = jwtService.verify<TokenDto>(
      response.body.refreshToken,
    )
    expect(refreshTokenDto.sub).toEqual(userId)
    expect(refreshTokenDto.scope).toEqual(TokenScope.User)
    expect(refreshTokenDto.authorities).toEqual(DEFAULT_REFRESH_AUTHORITIES)
  }

  function expectLegacyAuthResponseDto(
    res: Response,
    clientId: string,
    playerId?: string,
    nickname?: string,
  ) {
    expect(res.body).toEqual({
      token: expect.any(String),
      client: { id: clientId, name: '' },
      player: {
        id: playerId || expect.any(String),
        nickname: nickname || expect.any(String),
      },
    })
    const { sub, scope, authorities } = jwtService.verify<TokenDto>(
      res.body.token,
    )
    const isMatch = bcrypt.compareSync(clientId, sub)
    expect(isMatch).toBe(true)
    expect(scope).toEqual(TokenScope.Client)
    expect(authorities).toEqual([])
  }
})
