import { INestApplication } from '@nestjs/common'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import { closeTestApp, createTestApp } from '../../app/utils/test'
import { AuthService } from '../../auth/services'

describe('MediaController (e2e)', () => {
  let app: INestApplication
  let authService: AuthService

  beforeEach(async () => {
    app = await createTestApp()
    authService = app.get(AuthService)
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

  describe('/api/media/photos (GET)', () => {
    it('should succeed in retrieving photos', async () => {
      const clientId = uuidv4()

      const { token } = await authService.authenticate({ clientId })

      return supertest(app.getHttpServer())
        .get('/api/media/photos?search=nature&limit=10&offset=0')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            photos: [
              {
                photoURL:
                  'https://images.pexels.com/photos/247599/pexels-photo-247599.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
                thumbnailURL:
                  'https://images.pexels.com/photos/247599/pexels-photo-247599.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280',
                alt: 'Lush green terraced rice fields with a rustic hut under soft sunlight.',
              },
            ],
            total: 1,
            limit: 10,
            offset: 0,
          })
        })
    })

    it('should return a 401 error when the request is unauthorized', async () => {
      return supertest(app.getHttpServer())
        .get('/api/media/photos')
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
