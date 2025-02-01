import { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import {
  GameMode,
  LanguageCode,
  MediaType,
  PLAYER_LINK_CODE_REGEX,
  QuestionType,
  QuizVisibility,
} from '@quiz/common'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import { closeTestApp, createTestApp } from '../../app/utils/test'
import { AuthService } from '../../auth/services'
import { PlayerService } from '../../player/services'
import { Player, PlayerModel } from '../../player/services/models/schemas'
import { QuizService } from '../../quiz/services'
import { ClientService } from '../services'
import { Client } from '../services/models/schemas'

describe('ClientController (e2e)', () => {
  let app: INestApplication
  let authService: AuthService
  let clientService: ClientService
  let playerModel: PlayerModel
  let playerService: PlayerService
  let quizService: QuizService

  beforeEach(async () => {
    app = await createTestApp()

    authService = app.get(AuthService)
    clientService = app.get(ClientService)
    playerModel = app.get<PlayerModel>(getModelToken(Player.name))
    playerService = app.get(PlayerService)
    quizService = app.get(QuizService)
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

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

  describe('/api/client/player/link (GET)', () => {
    it('should succeed in retrieving the client associated players link code', async () => {
      const clientId = uuidv4()

      const { token } = await authService.authenticate({ clientId })

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
      const { token } = await authenticate('ShadowWhirlwind')

      const { client, player: playerToLink } = await authenticate('FrostyBear')

      const { code } = await playerService.generateLinkCode(client)

      return supertest(app.getHttpServer())
        .post('/api/client/player/link')
        .set({ Authorization: `Bearer ${token}` })
        .send({ code })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: playerToLink.id,
            nickname: 'FrostyBear',
            created: playerToLink.created.toISOString(),
            modified: playerToLink.modified.toISOString(),
          })
        })
    })

    it('should fail in associating a player from an unknown link code', async () => {
      const { token } = await authenticate('ShadowWhirlwind')

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
      const { token } = await authenticate('ShadowWhirlwind')

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

  describe('/api/client/quizzes (POST)', () => {
    it('should succeed in retrieving an empty page of associated quizzes from a new authenticated client', async () => {
      const clientId = uuidv4()

      const { token } = await authService.authenticate({ clientId })

      return supertest(app.getHttpServer())
        .get('/api/client/quizzes')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results', [])
          expect(res.body).toHaveProperty('total', 0)
          expect(res.body).toHaveProperty('limit', 10)
          expect(res.body).toHaveProperty('offset', 0)
        })
    })

    it('should succeed in retrieving the associated quizzes from an existing authenticated client', async () => {
      const client1 = await clientService.findOrCreateClient(uuidv4())
      const originalQuiz = await quizService.createQuiz(
        {
          title: 'Trivia Battle',
          description: 'A fun and engaging trivia quiz for all ages.',
          mode: GameMode.Classic,
          visibility: QuizVisibility.Public,
          imageCoverURL: 'https://example.com/question-cover-image.png',
          languageCode: LanguageCode.English,
          questions: [
            {
              type: QuestionType.MultiChoice,
              question: 'What is the capital of Sweden?',
              media: {
                type: MediaType.Image,
                url: 'https://example.com/question-image.png',
              },
              options: [
                {
                  value: 'Stockholm',
                  correct: true,
                },
                {
                  value: 'Copenhagen',
                  correct: false,
                },
                {
                  value: 'London',
                  correct: false,
                },
                {
                  value: 'Berlin',
                  correct: false,
                },
              ],
              points: 1000,
              duration: 30,
            },
          ],
        },
        client1.player,
      )

      const client2 = await clientService.findOrCreateClient(uuidv4())
      await quizService.createQuiz(
        {
          title: 'Geography Explorer',
          description:
            'Test your knowledge about countries, capitals, and landmarks.',
          mode: GameMode.ZeroToOneHundred,
          visibility: QuizVisibility.Private,
          imageCoverURL: 'https://example.com/geography-cover-image.png',
          languageCode: LanguageCode.Swedish,
          questions: [
            {
              type: QuestionType.Range,
              question:
                'Guess the temperature of the hottest day ever recorded.',
              media: {
                type: MediaType.Image,
                url: 'https://example.com/question-image.png',
              },
              correct: 50,
              duration: 30,
            },
          ],
        },
        client2.player,
      )

      const { token } = await authService.authenticate({
        clientId: client1._id,
      })

      return supertest(app.getHttpServer())
        .get('/api/client/quizzes')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results')
          expect(res.body.results).toHaveLength(1)
          expect(res.body.results[0]).toHaveProperty('id')
          expect(res.body.results[0]).toHaveProperty(
            'title',
            originalQuiz.title,
          )
          expect(res.body.results[0]).toHaveProperty(
            'description',
            originalQuiz.description,
          )
          expect(res.body.results[0]).toHaveProperty(
            'visibility',
            originalQuiz.visibility,
          )
          expect(res.body.results[0]).toHaveProperty(
            'imageCoverURL',
            originalQuiz.imageCoverURL,
          )
          expect(res.body.results[0]).toHaveProperty(
            'languageCode',
            originalQuiz.languageCode,
          )
          expect(res.body.results[0]).toHaveProperty('created')
          expect(res.body.results[0]).toHaveProperty('updated')
          expect(res.body).toHaveProperty('total', 1)
          expect(res.body).toHaveProperty('limit', 10)
          expect(res.body).toHaveProperty('offset', 0)
        })
    })

    it('should fail in retrieving the associated quizzes without an authorization', async () => {
      return supertest(app.getHttpServer())
        .get('/api/client/quizzes')
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Unauthorized')
          expect(res.body).toHaveProperty('status', 401)
          expect(res.body).toHaveProperty('timestamp')
        })
    })
  })

  /**
   * description here.
   *
   * @param nickname
   */
  async function authenticate(
    nickname: string,
  ): Promise<{ token: string; client: Client; player: Player }> {
    const clientId = uuidv4()

    const client = await clientService.findOrCreateClient(clientId)

    const player = await playerModel.findByIdAndUpdate(client.player.id, {
      nickname,
    })

    const { token } = await authService.authenticate({ clientId })

    return { token, client, player }
  }
})
