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
  })

  afterAll(async () => {
    await stopMongoMemoryServer()
  })

  beforeEach(async () => {
    app = await createTestApp()
  })

  afterEach(async () => {
    await app.close()
  })

  it('/api/hello (GET)', () => {
    return supertest(app.getHttpServer())
      .get('/api/hello')
      .expect(200)
      .expect({ value: 'Hello, World!' })
  })
})
