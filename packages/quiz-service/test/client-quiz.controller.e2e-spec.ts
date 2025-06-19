import { INestApplication } from '@nestjs/common'
import {
  GameMode,
  LanguageCode,
  MediaType,
  QuestionType,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import { AuthService } from '../src/auth/services'
import { ClientService } from '../src/client/services'
import { QuizService } from '../src/quiz/services'

import { closeTestApp, createTestApp } from './utils/bootstrap'

describe('ClientQuizController (e2e)', () => {
  let app: INestApplication
  let authService: AuthService
  let clientService: ClientService
  let quizService: QuizService

  beforeEach(async () => {
    app = await createTestApp()

    authService = app.get(AuthService)
    clientService = app.get(ClientService)
    quizService = app.get(QuizService)
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

  describe('/api/client/quizzes (GET)', () => {
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
          category: QuizCategory.GeneralKnowledge,
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
          category: QuizCategory.GeneralKnowledge,
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
            'category',
            originalQuiz.category,
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
})
