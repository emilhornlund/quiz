import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import {
  createTestApp,
  initializeMongoMemoryServer,
  stopMongoMemoryServer,
} from '../../app/utils/test'
import { ClientService } from '../../client/services'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  let jwtService: JwtService
  let clientService: ClientService

  beforeAll(async () => {
    await initializeMongoMemoryServer()
  }, 30000)

  afterAll(async () => {
    await stopMongoMemoryServer()
  }, 30000)

  beforeEach(async () => {
    app = await createTestApp()
    jwtService = app.get(JwtService)
    clientService = app.get(ClientService)
  }, 30000)

  afterEach(async () => {
    await app.close()
  }, 30000)

  describe('/api/games (POST)', () => {
    it('should succeed in authenticating a new client', () => {
      const clientId = uuidv4()

      return supertest(app.getHttpServer())
        .post('/api/auth')
        .send({ clientId })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            token: expect.anything(),
            client: { id: clientId, name: '' },
            player: { id: expect.anything(), nickname: '' },
          })
          const { sub } = jwtService.verify(res.body.token)
          const isMatch = bcrypt.compareSync(clientId, sub)
          expect(isMatch).toBe(true)
        })
    })

    it('should succeed in authenticating an existing client', async () => {
      const clientId = uuidv4()

      const { _id } = await clientService.findOrCreateClient(clientId)

      expect(clientId).toEqual(_id)

      return supertest(app.getHttpServer())
        .post('/api/auth')
        .send({ clientId })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            token: expect.anything(),
            client: { id: clientId, name: '' },
            player: { id: expect.anything(), nickname: '' },
          })
          const { sub } = jwtService.verify(res.body.token)
          const isMatch = bcrypt.compareSync(_id, sub)
          expect(isMatch).toBe(true)
        })
    })

    it('should fail in authenticating without a client id', async () => {
      return supertest(app.getHttpServer())
        .post('/api/auth')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Validation failed')
          expect(res.body).toHaveProperty('status', 400)
          expect(res.body).toHaveProperty('timestamp')
          expect(res.body).toHaveProperty('validationErrors', [
            {
              property: 'clientId',
              constraints: {
                isNotEmpty: 'clientId should not be empty',
                isUuid: 'clientId must be a UUID',
              },
            },
          ])
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
})
