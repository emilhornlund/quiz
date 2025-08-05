import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { getModelToken } from '@nestjs/mongoose'
import {
  GameParticipantType,
  GameTokenDto,
  TokenDto,
  TokenScope,
} from '@quiz/common'
import { Response } from 'superagent'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import {
  buildMockPrimaryGoogleUser,
  buildMockPrimaryUser,
  createMockGameDocument,
  createMockGameHostParticipantDocument,
  MOCK_PRIMARY_GOOGLE_USER_ID,
  MOCK_PRIMARY_INVALID_PASSWORD,
  MOCK_PRIMARY_PASSWORD,
  MOCK_PRIMARY_USER_EMAIL,
  MOCK_SECONDARY_PASSWORD,
  MOCK_WEAK_PASSWORD,
} from '../../../test-utils/data'
import {
  MOCK_GOOGLE_VALID_CODE,
  MOCK_GOOGLE_VALID_CODE_VERIFIER,
} from '../../../test-utils/data/google-auth.data'
import {
  closeTestApp,
  createDefaultUserAndAuthenticate,
  createTestApp,
} from '../../../test-utils/utils'
import { Game, GameModel } from '../../game/repositories/models/schemas'
import { User, UserModel } from '../../user/repositories'
import { AuthService } from '../services'
import {
  DEFAULT_GAME_AUTHORITIES,
  DEFAULT_REFRESH_AUTHORITIES,
  DEFAULT_USER_AUTHORITIES,
} from '../services/utils'

const MOCK_IP_ADDRESS = '0.0.0.0'
const MOCK_USER_AGENT = 'mock-user-agent'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  let jwtService: JwtService
  let authService: AuthService
  let userModel: UserModel
  let gameModel: GameModel

  beforeEach(async () => {
    app = await createTestApp()
    jwtService = app.get(JwtService)
    authService = app.get<AuthService>(AuthService)
    userModel = app.get<UserModel>(getModelToken(User.name))
    gameModel = app.get<GameModel>(getModelToken(Game.name))
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

  describe('/api/auth/login (POST)', () => {
    it('should succeed in authenticating a user', async () => {
      const user = await userModel.create(buildMockPrimaryUser())

      return supertest(app.getHttpServer())
        .post('/api/auth/login')
        .set('User-Agent', MOCK_USER_AGENT)
        .send({
          email: MOCK_PRIMARY_USER_EMAIL,
          password: MOCK_PRIMARY_PASSWORD,
        })
        .expect(200)
        .expect((res) => {
          expectAuthLoginRequestDto(user._id, res)
        })
    })

    it('should return 400 bad request when email not found', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/login')
        .set('User-Agent', MOCK_USER_AGENT)
        .send({
          email: MOCK_PRIMARY_USER_EMAIL,
          password: MOCK_PRIMARY_PASSWORD,
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
        .set('User-Agent', MOCK_USER_AGENT)
        .send({
          email: MOCK_PRIMARY_USER_EMAIL,
          password: MOCK_PRIMARY_INVALID_PASSWORD,
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
        .set('User-Agent', MOCK_USER_AGENT)
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

    it('should return 400 bad request when missing user agent', async () => {
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
                  notEmpty: 'User agent is required.',
                },
                property: 'user-agent',
              },
            ],
          })
        })
    })
  })

  describe('/api/auth/google/exchange (POST)', () => {
    it('should successfully authenticate a new google user', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/google/exchange')
        .set('User-Agent', MOCK_USER_AGENT)
        .send({
          code: MOCK_GOOGLE_VALID_CODE,
          codeVerifier: MOCK_GOOGLE_VALID_CODE_VERIFIER,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          })
        })
    })

    it('should successfully authenticate an existing google user', async () => {
      await userModel.create(
        buildMockPrimaryGoogleUser({
          googleUserId: MOCK_PRIMARY_GOOGLE_USER_ID,
          email: MOCK_PRIMARY_USER_EMAIL,
        }),
      )

      return supertest(app.getHttpServer())
        .post('/api/auth/google/exchange')
        .set('User-Agent', MOCK_USER_AGENT)
        .send({
          code: MOCK_GOOGLE_VALID_CODE,
          codeVerifier: MOCK_GOOGLE_VALID_CODE_VERIFIER,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          })
        })
    })

    it('should return 409 conflict when the email is already registered', async () => {
      await userModel.create(
        buildMockPrimaryUser({
          email: MOCK_PRIMARY_USER_EMAIL,
        }),
      )

      return supertest(app.getHttpServer())
        .post('/api/auth/google/exchange')
        .set('User-Agent', MOCK_USER_AGENT)
        .send({
          code: MOCK_GOOGLE_VALID_CODE,
          codeVerifier: MOCK_GOOGLE_VALID_CODE_VERIFIER,
        })
        .expect(409)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Email already exists',
            status: 409,
            timestamp: expect.any(String),
          })
        })
    })

    it('should return 400 bad request when validation fails', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/google/exchange')
        .set('User-Agent', MOCK_USER_AGENT)
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
                  matches:
                    'Invalid code format. Only URL-safe characters (“A–Z”, “a–z”, “0–9”, “-”, “_”, “/”) are allowed.',
                  maxLength: 'Code must be at most 512 characters long.',
                  minLength: 'Code must be at least 10 characters long.',
                },
                property: 'code',
              },
              {
                constraints: {
                  matches:
                    'Invalid code verifier format. Only unreserved URI characters (“A–Z”, “a–z”, “0–9”, “-”, “.”, “_”, “~”) are allowed.',
                  maxLength:
                    'Code verifier must be at most 128 characters long.',
                  minLength:
                    'Code verifier must be at least 43 characters long.',
                },
                property: 'codeVerifier',
              },
            ],
          })
        })
    })

    it('should return 400 bad request when missing user agent', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/google/exchange')
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
                  notEmpty: 'User agent is required.',
                },
                property: 'user-agent',
              },
            ],
          })
        })
    })
  })

  describe('/api/auth/game (POST)', () => {
    it('should succeed in authenticating a user participant using a game id', async () => {
      const { accessToken, user } = await createDefaultUserAndAuthenticate(app)

      const game = await gameModel.create(createMockGameDocument())

      return supertest(app.getHttpServer())
        .post('/api/auth/game')
        .set({
          'User-Agent': MOCK_USER_AGENT,
          Authorization: `Bearer ${accessToken}`,
        })
        .send({ gameId: game._id })
        .expect(200)
        .expect((res) => {
          expectGameTokenPair(game._id, GameParticipantType.HOST, res, user._id)
        })
    })

    it('should succeed in authenticating a user participant using a game PIN', async () => {
      const { accessToken, user } = await createDefaultUserAndAuthenticate(app)

      const game = await gameModel.create(createMockGameDocument())

      return supertest(app.getHttpServer())
        .post('/api/auth/game')
        .set({
          'User-Agent': MOCK_USER_AGENT,
          Authorization: `Bearer ${accessToken}`,
        })
        .send({ gamePIN: game.pin })
        .expect(200)
        .expect((res) => {
          expectGameTokenPair(game._id, GameParticipantType.HOST, res, user._id)
        })
    })

    it('should succeed in authenticating an anonymous participant using a game id', async () => {
      const game = await gameModel.create(
        createMockGameDocument({
          participants: [createMockGameHostParticipantDocument()],
        }),
      )

      return supertest(app.getHttpServer())
        .post('/api/auth/game')
        .set({ 'User-Agent': MOCK_USER_AGENT })
        .send({ gameId: game._id })
        .expect(200)
        .expect((res) => {
          expectGameTokenPair(game._id, GameParticipantType.PLAYER, res)
        })
    })

    it('should succeed in authenticating an anonymous participant using a game PIN', async () => {
      const game = await gameModel.create(
        createMockGameDocument({
          participants: [createMockGameHostParticipantDocument()],
        }),
      )

      return supertest(app.getHttpServer())
        .post('/api/auth/game')
        .set({ 'User-Agent': MOCK_USER_AGENT })
        .send({ gamePIN: game.pin })
        .expect(200)
        .expect((res) => {
          expectGameTokenPair(game._id, GameParticipantType.PLAYER, res)
        })
    })

    it('should return 400 error when game id validation fails', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/game')
        .set({ 'User-Agent': MOCK_USER_AGENT })
        .send({ gameId: 'non-uuid' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            status: 400,
            timestamp: expect.any(String),
            validationErrors: [
              {
                constraints: {
                  isUuid: 'gameId must be a UUID',
                },
                property: 'gameId',
              },
            ],
          })
        })
    })

    it('should return 400 error when game PIN validation fails', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/game')
        .set({ 'User-Agent': MOCK_USER_AGENT })
        .send({ gamePIN: 'XXXXXX' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            status: 400,
            timestamp: expect.any(String),
            validationErrors: [
              {
                constraints: {
                  matches: 'gamePIN must be a valid game PIN.',
                },
                property: 'gamePIN',
              },
            ],
          })
        })
    })

    it('should return 400 error when no request payload is provided', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/game')
        .set({ 'User-Agent': MOCK_USER_AGENT })
        .send()
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Missing request payload',
            status: 400,
            timestamp: expect.any(String),
          })
        })
    })

    it('should return 400 error when no game id or game PIN are provided', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/game')
        .set({ 'User-Agent': MOCK_USER_AGENT })
        .send({ gameId: undefined, gamePIN: undefined })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            status: 400,
            timestamp: expect.any(String),
            validationErrors: [
              {
                constraints: {
                  isUuid: 'gameId must be a UUID',
                },
                property: 'gameId',
              },
              {
                constraints: {
                  matches: 'gamePIN must be a valid game PIN.',
                },
                property: 'gamePIN',
              },
            ],
          })
        })
    })

    it('should return 400 bad request when missing user agent', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/game')
        .send({ gamePIN: '123456' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            status: 400,
            timestamp: expect.any(String),
            validationErrors: [
              {
                constraints: {
                  notEmpty: 'User agent is required.',
                },
                property: 'user-agent',
              },
            ],
          })
        })
    })

    it('should return 401 error when an active game was not found by game id', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/game')
        .set({ 'User-Agent': MOCK_USER_AGENT })
        .send({ gameId: uuidv4() })
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Unauthorized',
            status: 401,
            timestamp: expect.any(String),
          })
        })
    })

    it('should return 401 error when an active game was not found by game PIN', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/game')
        .set({ 'User-Agent': MOCK_USER_AGENT })
        .send({ gamePIN: '123456' })
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Unauthorized',
            status: 401,
            timestamp: expect.any(String),
          })
        })
    })
  })

  describe('/api/auth/refresh (POST)', () => {
    it('should succeed in refresh an existing authentication', async () => {
      const user = await userModel.create(buildMockPrimaryUser())

      const { refreshToken } = await authService.login(
        {
          email: MOCK_PRIMARY_USER_EMAIL,
          password: MOCK_PRIMARY_PASSWORD,
        },
        MOCK_IP_ADDRESS,
        MOCK_USER_AGENT,
      )

      return supertest(app.getHttpServer())
        .post('/api/auth/refresh')
        .set({ 'User-Agent': MOCK_USER_AGENT })
        .send({
          refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expectAuthLoginRequestDto(user._id, res)
        })
    })

    it('should succeed in refresh an existing authentication for a game', async () => {
      const game = await gameModel.create(createMockGameDocument())

      const userId = uuidv4()

      const { refreshToken } = await authService.authenticateGame(
        { gamePIN: game.pin },
        MOCK_IP_ADDRESS,
        MOCK_USER_AGENT,
        userId,
      )

      return supertest(app.getHttpServer())
        .post('/api/auth/refresh')
        .set({ 'User-Agent': MOCK_USER_AGENT })
        .send({
          refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expectGameTokenPair(game._id, GameParticipantType.HOST, res, userId)
        })
    })

    it('should return 401 unauthorized when token has expired', async () => {
      const refreshToken = await jwtService.signAsync(
        { authorities: DEFAULT_REFRESH_AUTHORITIES },
        { subject: uuidv4(), expiresIn: '-1d' },
      )

      return supertest(app.getHttpServer())
        .post('/api/auth/refresh')
        .set({ 'User-Agent': MOCK_USER_AGENT })
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

    it('should return 401 unauthorized when token already revoked', async () => {
      const game = await gameModel.create(createMockGameDocument())

      const userId = uuidv4()

      const { refreshToken } = await authService.authenticateGame(
        { gamePIN: game.pin },
        MOCK_IP_ADDRESS,
        MOCK_USER_AGENT,
        userId,
      )

      await authService.revoke(refreshToken)

      return supertest(app.getHttpServer())
        .post('/api/auth/refresh')
        .set({ 'User-Agent': MOCK_USER_AGENT })
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
        .set({ 'User-Agent': MOCK_USER_AGENT })
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
        .set({ 'User-Agent': MOCK_USER_AGENT })
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

    it('should return 400 bad request when missing user agent', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/refresh')
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
                  notEmpty: 'User agent is required.',
                },
                property: 'user-agent',
              },
            ],
          })
        })
    })
  })

  describe('/api/auth/revoke (POST)', () => {
    it('should succeed in revoking an existing user scope access token', async () => {
      await userModel.create(buildMockPrimaryUser())

      const { accessToken } = await authService.login(
        {
          email: MOCK_PRIMARY_USER_EMAIL,
          password: MOCK_PRIMARY_PASSWORD,
        },
        MOCK_IP_ADDRESS,
        MOCK_USER_AGENT,
      )

      return supertest(app.getHttpServer())
        .post('/api/auth/revoke')
        .set({
          'User-Agent': MOCK_USER_AGENT,
        })
        .send({
          token: accessToken,
        })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should succeed in revoking an existing user scope refresh token', async () => {
      await userModel.create(buildMockPrimaryUser())

      const { refreshToken } = await authService.login(
        {
          email: MOCK_PRIMARY_USER_EMAIL,
          password: MOCK_PRIMARY_PASSWORD,
        },
        MOCK_IP_ADDRESS,
        MOCK_USER_AGENT,
      )

      return supertest(app.getHttpServer())
        .post('/api/auth/revoke')
        .set({
          'User-Agent': MOCK_USER_AGENT,
        })
        .send({
          token: refreshToken,
        })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should succeed in revoking an existing game scope access token', async () => {
      const game = await gameModel.create(createMockGameDocument())

      const userId = uuidv4()

      const { accessToken } = await authService.authenticateGame(
        { gamePIN: game.pin },
        MOCK_IP_ADDRESS,
        MOCK_USER_AGENT,
        userId,
      )

      return supertest(app.getHttpServer())
        .post('/api/auth/revoke')
        .set({ 'User-Agent': MOCK_USER_AGENT })
        .send({
          token: accessToken,
        })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should succeed in revoking an existing game scope refresh token', async () => {
      const game = await gameModel.create(createMockGameDocument())

      const userId = uuidv4()

      const { refreshToken } = await authService.authenticateGame(
        { gamePIN: game.pin },
        MOCK_IP_ADDRESS,
        MOCK_USER_AGENT,
        userId,
      )

      return supertest(app.getHttpServer())
        .post('/api/auth/revoke')
        .set({ 'User-Agent': MOCK_USER_AGENT })
        .send({
          token: refreshToken,
        })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should return 400 bad request when validation fails', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/revoke')
        .set({ 'User-Agent': MOCK_USER_AGENT })
        .send({
          token: 'invalid_jwt',
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
                  isJwt: 'token must be a jwt string',
                },
                property: 'token',
              },
            ],
          })
        })
    })

    describe('/api/auth/password (PATCH)', () => {
      it('should succeed in changing password of an existing user', async () => {
        await userModel.create(buildMockPrimaryUser())

        const { accessToken } = await authService.login(
          {
            email: MOCK_PRIMARY_USER_EMAIL,
            password: MOCK_PRIMARY_PASSWORD,
          },
          MOCK_IP_ADDRESS,
          MOCK_USER_AGENT,
        )

        return supertest(app.getHttpServer())
          .patch('/api/auth/password')
          .set({
            Authorization: `Bearer ${accessToken}`,
          })
          .send({
            oldPassword: MOCK_PRIMARY_PASSWORD,
            newPassword: MOCK_SECONDARY_PASSWORD,
          })
          .expect(204)
          .expect((res) => {
            expect(res.body).toEqual({})
          })
      })

      it('should return 400 bad request when old password is incorrect', async () => {
        await userModel.create(buildMockPrimaryUser())

        const { accessToken } = await authService.login(
          {
            email: MOCK_PRIMARY_USER_EMAIL,
            password: MOCK_PRIMARY_PASSWORD,
          },
          MOCK_IP_ADDRESS,
          MOCK_USER_AGENT,
        )

        return supertest(app.getHttpServer())
          .patch('/api/auth/password')
          .set({
            Authorization: `Bearer ${accessToken}`,
          })
          .send({
            oldPassword: MOCK_SECONDARY_PASSWORD,
            newPassword: MOCK_PRIMARY_PASSWORD,
          })
          .expect(400)
          .expect((res) => {
            expect(res.body).toEqual({
              message: 'Old password is incorrect',
              status: 400,
              timestamp: expect.any(String),
            })
          })
      })

      it('should return 400 bad request when passwords are invalid', async () => {
        await userModel.create(buildMockPrimaryUser())

        const { accessToken } = await authService.login(
          {
            email: MOCK_PRIMARY_USER_EMAIL,
            password: MOCK_PRIMARY_PASSWORD,
          },
          MOCK_IP_ADDRESS,
          MOCK_USER_AGENT,
        )

        return supertest(app.getHttpServer())
          .patch('/api/auth/password')
          .set({
            Authorization: `Bearer ${accessToken}`,
          })
          .send({
            oldPassword: MOCK_WEAK_PASSWORD,
            newPassword: MOCK_WEAK_PASSWORD,
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
                    matches:
                      'Old password must include at least 2 uppercase letters, 2 lowercase letters, 2 digits, and 2 symbols.',
                  },
                  property: 'oldPassword',
                },
                {
                  constraints: {
                    matches:
                      'New password must include at least 2 uppercase letters, 2 lowercase letters, 2 digits, and 2 symbols.',
                  },
                  property: 'newPassword',
                },
              ],
            })
          })
      })

      it('should return 401 unauthorized when missing authorization', async () => {
        return supertest(app.getHttpServer())
          .patch('/api/auth/password')
          .send({
            oldPassword: MOCK_PRIMARY_PASSWORD,
            newPassword: MOCK_SECONDARY_PASSWORD,
          })
          .expect(401)
          .expect((res) => {
            expect(res.body).toEqual({
              message: 'Missing Authorization header',
              status: 401,
              timestamp: expect.any(String),
            })
          })
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
    expect(accessTokenDto.jti).toEqual(expect.any(String))
    expect(accessTokenDto.sub).toEqual(userId)
    expect(accessTokenDto.scope).toEqual(TokenScope.User)
    expect(accessTokenDto.authorities).toEqual(DEFAULT_USER_AUTHORITIES)

    const refreshTokenDto = jwtService.verify<TokenDto>(
      response.body.refreshToken,
    )
    expect(refreshTokenDto.jti).toEqual(expect.any(String))
    expect(refreshTokenDto.sub).toEqual(userId)
    expect(refreshTokenDto.scope).toEqual(TokenScope.User)
    expect(refreshTokenDto.authorities).toEqual(DEFAULT_REFRESH_AUTHORITIES)
  }

  function expectGameTokenPair(
    gameId: string,
    participantType: GameParticipantType,
    response: Response,
    participantId?: string,
  ) {
    expect(response.body).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    })

    const accessTokenDto = jwtService.verify<GameTokenDto>(
      response.body.accessToken,
    )
    expect(accessTokenDto.jti).toEqual(expect.any(String))
    expect(accessTokenDto.sub).toEqual(participantId || expect.any(String))
    expect(accessTokenDto.scope).toEqual(TokenScope.Game)
    expect(accessTokenDto.authorities).toEqual(DEFAULT_GAME_AUTHORITIES)
    expect(accessTokenDto.gameId).toEqual(gameId)
    expect(accessTokenDto.participantType).toEqual(participantType)

    const refreshTokenDto = jwtService.verify<GameTokenDto>(
      response.body.refreshToken,
    )
    expect(refreshTokenDto.jti).toEqual(expect.any(String))
    expect(refreshTokenDto.sub).toEqual(participantId || expect.any(String))
    expect(refreshTokenDto.scope).toEqual(TokenScope.Game)
    expect(refreshTokenDto.authorities).toEqual(DEFAULT_REFRESH_AUTHORITIES)
    expect(refreshTokenDto.gameId).toEqual(gameId)
    expect(refreshTokenDto.participantType).toEqual(participantType)
  }
})
