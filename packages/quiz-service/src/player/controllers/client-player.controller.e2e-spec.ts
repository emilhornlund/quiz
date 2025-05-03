import { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { PLAYER_LINK_CODE_REGEX } from '@quiz/common'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import {
  createMockClientDocument,
  createMockPlayerDocument,
  MOCK_DEFAULT_PLAYER_ID,
  MOCK_DEFAULT_PLAYER_NICKNAME,
  MOCK_SECONDARY_PLAYER_NICKNAME,
} from '../../../test/data'
import { closeTestApp, createTestApp } from '../../app/utils/test'
import { AuthService } from '../../auth/services'
import { Client, ClientModel } from '../../client/services/models/schemas'
import { PlayerService } from '../services'
import { Player, PlayerModel } from '../services/models/schemas'

describe('ClientPlayerController (e2e)', () => {
  let app: INestApplication
  let authService: AuthService
  let playerService: PlayerService
  let playerModel: PlayerModel
  let clientModel: ClientModel

  let client: Client

  beforeEach(async () => {
    app = await createTestApp()
    authService = app.get(AuthService)
    playerService = app.get(PlayerService)
    playerModel = app.get<PlayerModel>(getModelToken(Player.name))
    clientModel = app.get<ClientModel>(getModelToken(Client.name))

    await playerModel.create(createMockPlayerDocument())
    client = await clientModel.create(createMockClientDocument())
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

  describe('/api/client/player (GET)', () => {
    it('should succeed in retrieving the associated player from a new authenticated client', async () => {
      const {
        token,
        player: { id, nickname },
      } = await authService.authenticate({ clientId: client._id })

      return supertest(app.getHttpServer())
        .get('/api/client/player')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id,
            nickname,
            created: expect.anything(),
            modified: expect.anything(),
          })
        })
    })

    it('should succeed in retrieving the associated player from an existing authenticated client', async () => {
      const { token } = await authService.authenticate({ clientId: client._id })

      return supertest(app.getHttpServer())
        .get('/api/client/player')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: MOCK_DEFAULT_PLAYER_ID,
            nickname: MOCK_DEFAULT_PLAYER_NICKNAME,
            created: expect.anything(),
            modified: expect.anything(),
          })
        })
    })

    it('should fail in retrieving the associated player without authorization', async () => {
      return supertest(app.getHttpServer())
        .get('/api/client/player')
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Unauthorized',
            status: 401,
            timestamp: expect.anything(),
          })
        })
    })
  })

  describe('/api/client/player (PUT)', () => {
    it('should update player nickname successfully', async () => {
      const { token } = await authService.authenticate({ clientId: client._id })

      return supertest(app.getHttpServer())
        .put('/api/client/player')
        .set({ Authorization: `Bearer ${token}` })
        .send({ nickname: MOCK_SECONDARY_PLAYER_NICKNAME })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: expect.anything(),
            nickname: MOCK_SECONDARY_PLAYER_NICKNAME,
            created: expect.anything(),
            modified: expect.anything(),
          })
        })
    })

    it('should update player nickname containing emojis successfully', async () => {
      const { token } = await authService.authenticate({ clientId: client._id })

      return supertest(app.getHttpServer())
        .put('/api/client/player')
        .set({ Authorization: `Bearer ${token}` })
        .send({ nickname: '🥶🐻' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: expect.anything(),
            nickname: '🥶🐻',
            created: expect.anything(),
            modified: expect.anything(),
          })
        })
    })

    it('should handle validation errors for invalid nickname', async () => {
      const { token } = await authService.authenticate({ clientId: client._id })

      return supertest(app.getHttpServer())
        .put('/api/client/player')
        .set({ Authorization: `Bearer ${token}` })
        .send({ nickname: undefined })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            status: 400,
            timestamp: expect.anything(),
            validationErrors: [
              {
                constraints: {
                  isString: 'nickname must be a string',
                  matches:
                    'Nickname can only contain letters, numbers, and underscores.',
                  maxLength:
                    'nickname must be shorter than or equal to 20 characters',
                  minLength:
                    'nickname must be longer than or equal to 2 characters',
                },
                property: 'nickname',
              },
            ],
          })
        })
    })

    it('should return 401 if client is unauthorized', async () => {
      return supertest(app.getHttpServer())
        .put('/api/client/player')
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Unauthorized',
            status: 401,
            timestamp: expect.anything(),
          })
        })
    })
  })

  describe('/api/client/player/link (GET)', () => {
    it('should succeed in retrieving the client associated players link code', async () => {
      const { token } = await authService.authenticate({ clientId: client._id })

      return supertest(app.getHttpServer())
        .get('/api/client/player/link')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            code: expect.stringMatching(PLAYER_LINK_CODE_REGEX),
            expires: expect.anything(),
          })
        })
    })

    it('should fail in retrieving the client associated players link code without a token', async () => {
      return supertest(app.getHttpServer())
        .get('/api/client/player/link')
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Unauthorized',
            status: 401,
            timestamp: expect.anything(),
          })
        })
    })
  })

  describe('/api/client/player/link (POST)', () => {
    it('should succeed in associating a player from a valid link code', async () => {
      const { token } = await authService.authenticate({ clientId: client._id })

      const anotherPlayer = await playerModel.create(
        createMockPlayerDocument({
          _id: uuidv4(),
          nickname: MOCK_SECONDARY_PLAYER_NICKNAME,
        }),
      )
      const anotherClient = await clientModel.create(
        createMockClientDocument({ player: anotherPlayer }),
      )

      const { code } = await playerService.generateLinkCode(anotherClient)

      await supertest(app.getHttpServer())
        .post('/api/client/player/link')
        .set({ Authorization: `Bearer ${token}` })
        .send({ code })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: anotherPlayer._id,
            nickname: anotherPlayer.nickname,
            created: anotherPlayer.created.toISOString(),
            modified: anotherPlayer.modified.toISOString(),
          })
        })

      const updatedClient = await clientModel
        .findOne({ _id: client._id })
        .populate('player')

      expect(updatedClient.player._id).toEqual(anotherPlayer._id)
    })

    it('should fail in associating a player from an unknown link code', async () => {
      const { token } = await authService.authenticate({ clientId: client._id })

      return supertest(app.getHttpServer())
        .post('/api/client/player/link')
        .set({ Authorization: `Bearer ${token}` })
        .send({ code: 'XXXX-XXXX' })
        .expect(404)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Player link code was not found',
            status: 404,
            timestamp: expect.anything(),
          })
        })
    })

    it('should fail in associating a player from an invalid link code', async () => {
      const { token } = await authService.authenticate({ clientId: client._id })

      return supertest(app.getHttpServer())
        .post('/api/client/player/link')
        .set({ Authorization: `Bearer ${token}` })
        .send({ code: '' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            validationErrors: [
              {
                property: 'code',
                constraints: {
                  isNotEmpty: 'code should not be empty',
                  matches: `The code must match the pattern ${PLAYER_LINK_CODE_REGEX}`,
                },
              },
            ],
            status: 400,
            timestamp: expect.anything(),
          })
        })
    })

    it('should fail in associating a player without a token', async () => {
      return supertest(app.getHttpServer())
        .post('/api/client/player/link')
        .send({ code: 'XXXX-XXXX' })
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Unauthorized',
            status: 401,
            timestamp: expect.anything(),
          })
        })
    })
  })
})
