import { INestApplication } from '@nestjs/common'
import supertest from 'supertest'

import {
  createTestApp,
  initializeMongoMemoryServer,
  stopMongoMemoryServer,
} from '../utils/test'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    await initializeMongoMemoryServer()
  }, 30000)

  afterAll(async () => {
    await stopMongoMemoryServer()
  }, 30000)

  beforeEach(async () => {
    app = await createTestApp()
  }, 30000)

  afterEach(async () => {
    await app.close()
  }, 30000)

  it('/api/hello (GET)', () => {
    return supertest(app.getHttpServer())
      .get('/api/hello')
      .expect(200)
      .expect({ value: 'Hello, World!' })
  })
})
