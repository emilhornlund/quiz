import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { getModelToken } from '@nestjs/mongoose'
import {
  GameParticipantType,
  GameTokenDto,
  TokenDto,
  TokenScope,
} from '@quiz/common'
import * as bcrypt from 'bcryptjs'
import { Response } from 'superagent'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import {
  buildMockPrimaryUser,
  createMockGameDocument,
  createMockGameHostParticipantDocument,
  createMockPlayerDocument,
  MOCK_DEFAULT_INVALID_PASSWORD,
  MOCK_DEFAULT_PASSWORD,
  MOCK_PRIMARY_USER_EMAIL,
} from '../../../test-utils/data'
import {
  closeTestApp,
  createDefaultUserAndAuthenticate,
  createTestApp,
} from '../../../test-utils/utils'
import { ClientService } from '../../client/services'
import { Game, GameModel } from '../../game/services/models/schemas'
import { Player, PlayerModel } from '../../player/services/models/schemas'
import { User, UserModel } from '../../user/services/models/schemas'
import { AuthService } from '../services'
import {
  DEFAULT_GAME_AUTHORITIES,
  DEFAULT_REFRESH_AUTHORITIES,
  DEFAULT_USER_AUTHORITIES,
} from '../services/utils'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  let jwtService: JwtService
  let clientService: ClientService
  let authService: AuthService
  let userModel: UserModel
  let gameModel: GameModel
  let playerModel: PlayerModel

  beforeEach(async () => {
    app = await createTestApp()
    jwtService = app.get(JwtService)
    clientService = app.get(ClientService)
    authService = app.get<AuthService>(AuthService)
    userModel = app.get<UserModel>(getModelToken(User.name))
    gameModel = app.get<GameModel>(getModelToken(Game.name))
    playerModel = app.get<PlayerModel>(getModelToken(Player.name))
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

  describe('/api/login (POST)', () => {
    it('should succeed in authenticating a user', async () => {
      const user = await userModel.create(buildMockPrimaryUser())

      return supertest(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: MOCK_PRIMARY_USER_EMAIL,
          password: MOCK_DEFAULT_PASSWORD,
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
          email: MOCK_PRIMARY_USER_EMAIL,
          password: MOCK_DEFAULT_PASSWORD,
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
          email: MOCK_PRIMARY_USER_EMAIL,
          password: MOCK_DEFAULT_INVALID_PASSWORD,
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

  describe('/api/auth/games/:gamePIN (POST)', () => {
    it('should succeed in authenticating a user for a game', async () => {
      const { accessToken, user } = await createDefaultUserAndAuthenticate(app)

      const game = await gameModel.create(createMockGameDocument())

      return supertest(app.getHttpServer())
        .post(`/api/auth/games/${game.pin}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send()
        .expect(200)
        .expect((res) => {
          expectGameTokenPair(game._id, GameParticipantType.HOST, res, user._id)
        })
    })

    it('should succeed in authenticating an anonymous participant for a game', async () => {
      const player = await playerModel.create(createMockPlayerDocument())

      const game = await gameModel.create(
        createMockGameDocument({
          participants: [createMockGameHostParticipantDocument({ player })],
        }),
      )

      return supertest(app.getHttpServer())
        .post(`/api/auth/games/${game.pin}`)
        .send()
        .expect(200)
        .expect((res) => {
          expectGameTokenPair(game._id, GameParticipantType.PLAYER, res)
        })
    })

    it('should 400 404 error when game PIN validation fails', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/games/XXXXXX')
        .send()
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            status: 400,
            timestamp: expect.any(String),
          })
        })
    })

    it('should return 404 error when an active game was not found', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth/games/123456')
        .send()
        .expect(404)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Active game not found by PIN 123456',
            status: 404,
            timestamp: expect.any(String),
          })
        })
    })
  })

  describe('/api/refresh (POST)', () => {
    it('should succeed in refresh an existing authentication', async () => {
      const user = await userModel.create(buildMockPrimaryUser())

      const { refreshToken } = await authService.login({
        email: MOCK_PRIMARY_USER_EMAIL,
        password: MOCK_DEFAULT_PASSWORD,
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

    it('should succeed in refresh an existing authentication for a game', async () => {
      const game = await gameModel.create(createMockGameDocument())

      const userId = uuidv4()

      const { refreshToken } = await authService.authenticateGame(
        game.pin,
        userId,
      )

      return supertest(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expectGameTokenPair(game._id, GameParticipantType.HOST, res, userId)
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
    expect(accessTokenDto.sub).toEqual(participantId || expect.any(String))
    expect(accessTokenDto.scope).toEqual(TokenScope.Game)
    expect(accessTokenDto.authorities).toEqual(DEFAULT_GAME_AUTHORITIES)
    expect(accessTokenDto.gameId).toEqual(gameId)
    expect(accessTokenDto.participantType).toEqual(participantType)

    const refreshTokenDto = jwtService.verify<GameTokenDto>(
      response.body.refreshToken,
    )
    expect(refreshTokenDto.sub).toEqual(participantId || expect.any(String))
    expect(refreshTokenDto.scope).toEqual(TokenScope.Game)
    expect(refreshTokenDto.authorities).toEqual(DEFAULT_REFRESH_AUTHORITIES)
    expect(refreshTokenDto.gameId).toEqual(gameId)
    expect(refreshTokenDto.participantType).toEqual(participantType)
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
