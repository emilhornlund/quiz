import { rm } from 'node:fs/promises'
import { dirname, join } from 'path'

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

  describe('/api/media/uploads/photos (POST)', () => {
    test.each([['gif'], ['jpeg'], ['jpg'], ['png'], ['tiff'], ['webp']])(
      'should succeed in uploading a %s image',
      async (extension) => {
        const { token } = await authService.authenticate({ clientId: uuidv4() })

        await supertest(app.getHttpServer())
          .post('/api/media/uploads/photos')
          .set({ Authorization: `Bearer ${token}` })
          .attach(
            'file',
            join(__dirname, `../../../test/assets/photo.${extension}`),
          )
          .expect(201)
          .expect((res) => {
            expect(res.body).toEqual({
              filename: expect.stringMatching(/^.*\/.*\.webp$/),
            })
            return rm(
              join(
                __dirname,
                '../../../',
                process.env.UPLOAD_DIRECTORY,
                `/${dirname(res.body.filename)}`,
              ),
              { recursive: true, force: true },
            )
          })
      },
    )

    it('should fail in uploading a non image file', async () => {
      const { token } = await authService.authenticate({ clientId: uuidv4() })

      return supertest(app.getHttpServer())
        .post('/api/media/uploads/photos')
        .set({ Authorization: `Bearer ${token}` })
        .attach('file', join(__dirname, '../../../test/assets/empty.txt'))
        .expect(422)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Unable to process image file',
            status: 422,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return a 401 error when the request is unauthorized', async () => {
      return supertest(app.getHttpServer())
        .post('/api/media/uploads/photos')
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
