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

  describe('/api/discover/section/:key (GET)', () => {
    it('returns 200 with empty results when no snapshot exists', async () => {
      return supertest(app.getHttpServer())
        .get('/api/discover/section/TOP_RATED?limit=10&offset=20')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('key', 'TOP_RATED')
          expect(res.body).toHaveProperty('title', 'Top Rated')
          expect(res.body).toHaveProperty('results')
          expect(res.body.results).toEqual([])
          expect(res.body).toHaveProperty('snapshotTotal', 0)
          expect(res.body).toHaveProperty('limit', 10)
          expect(res.body).toHaveProperty('offset', 20)
        })
    })
  })
})
