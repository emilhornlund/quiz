import { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import {
  createTestApp,
  initializeMongoMemoryServer,
  stopMongoMemoryServer,
} from '../../app/utils/test'
import { AuthService } from '../../auth/services'
import { Player, PlayerModel } from '../../player/services/models/schemas'
import { ClientService } from '../services'

describe('ClientController (e2e)', () => {
  let app: INestApplication
  let authService: AuthService
  let clientService: ClientService
  let playerModel: PlayerModel

  beforeAll(async () => {
    await initializeMongoMemoryServer()
  }, 30000)

  afterAll(async () => {
    await stopMongoMemoryServer()
  }, 30000)

  beforeEach(async () => {
    app = await createTestApp()
    authService = app.get(AuthService)
    clientService = app.get(ClientService)
    playerModel = app.get<PlayerModel>(getModelToken(Player.name))
  }, 30000)

  afterEach(async () => {
    await app.close()
  }, 30000)

  describe('/api/client/player (POST)', () => {
    it('should succeed in retrieving the associated player from a new authenticated client', async () => {
      const clientId = uuidv4()

      const { token } = await authService.authenticate({ clientId })

      return supertest(app.getHttpServer())
        .get('/api/client/player')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
          expect(res.body).toHaveProperty('nickname', '')
          expect(res.body).toHaveProperty('created')
          expect(res.body).toHaveProperty('modified')
        })
    })

    it('should succeed in retrieving the associated player from an existing authenticated client', async () => {
      const clientId = uuidv4()
      const nickname = 'FrostyBear'
      const created = new Date()

      const client = await clientService.findOrCreateClient(clientId)

      const { token } = await authService.authenticate({ clientId })

      await playerModel
        .findByIdAndUpdate(client.player._id, {
          nickname,
          created,
          modified: created,
        })
        .exec()

      return supertest(app.getHttpServer())
        .get('/api/client/player')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: client.player._id,
            nickname,
            created: created.toISOString(),
            modified: created.toISOString(),
          })
        })
    })

    it('should fail in retrieving the associated player without authorization', async () => {
      return supertest(app.getHttpServer())
        .get('/api/client/player')
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Unauthorized')
          expect(res.body).toHaveProperty('status', 401)
          expect(res.body).toHaveProperty('timestamp')
        })
    })
  })
})
