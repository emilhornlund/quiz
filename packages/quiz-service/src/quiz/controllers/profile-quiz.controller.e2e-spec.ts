import { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import {
  GameMode,
  LanguageCode,
  MediaType,
  QuestionType,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import supertest from 'supertest'

import { buildMockSecondaryUser } from '../../../test-utils/data'
import {
  closeTestApp,
  createDefaultUserAndAuthenticate,
  createTestApp,
} from '../../../test-utils/utils'
import { User, UserModel } from '../../user/repositories'
import { QuizService } from '../services'

describe('ProfileQuizController (e2e)', () => {
  let app: INestApplication
  let quizService: QuizService
  let userModel: UserModel

  beforeEach(async () => {
    app = await createTestApp()
    quizService = app.get(QuizService)
    userModel = app.get<UserModel>(getModelToken(User.name))
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

  describe('/api/profile/quizzes (GET)', () => {
    it('should succeed in retrieving an empty page of associated quizzes from a new authenticated user', async () => {
      const { accessToken } = await createDefaultUserAndAuthenticate(app)

      return supertest(app.getHttpServer())
        .get('/api/profile/quizzes')
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results', [])
          expect(res.body).toHaveProperty('total', 0)
          expect(res.body).toHaveProperty('limit', 10)
          expect(res.body).toHaveProperty('offset', 0)
        })
    })

    it('should succeed in retrieving the associated quizzes from an existing authenticated user', async () => {
      const { accessToken, user: user1 } =
        await createDefaultUserAndAuthenticate(app)

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
        user1,
      )

      const user2 = await userModel.create(buildMockSecondaryUser())
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
        user2,
      )

      return supertest(app.getHttpServer())
        .get('/api/profile/quizzes')
        .set({ Authorization: `Bearer ${accessToken}` })
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
        .get('/api/profile/quizzes')
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            'Missing Authorization header',
          )
          expect(res.body).toHaveProperty('status', 401)
          expect(res.body).toHaveProperty('timestamp')
        })
    })
  })
})
