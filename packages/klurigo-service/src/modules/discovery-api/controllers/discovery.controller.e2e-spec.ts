import { INestApplication } from '@nestjs/common'
import supertest from 'supertest'

import { closeTestApp, createTestApp } from '../../../../test-utils/utils'

describe('DiscoveryController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    app = await createTestApp()
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

  describe('/api/discover (GET)', () => {
    it('returns 200 with empty sections and null generatedAt when no snapshot exists', async () => {
      return supertest(app.getHttpServer())
        .get('/api/discover')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('sections')
          expect(res.body.sections).toEqual([])
          expect(res.body).toHaveProperty('generatedAt')
          expect(res.body.generatedAt).toBeNull()
        })
    })
  })
})
