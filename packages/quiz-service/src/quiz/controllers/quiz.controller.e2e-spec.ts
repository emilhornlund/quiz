import { INestApplication } from '@nestjs/common'
import {
  GameMode,
  LanguageCode,
  MediaType,
  QuestionMultiChoiceDto,
  QuestionRangeAnswerMargin,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionType,
  QuestionTypeAnswerDto,
  QuestionZeroToOneHundredRangeDto,
  QuizCategory,
  QuizRequestDto,
  QuizResponseDto,
  QuizVisibility,
} from '@quiz/common'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import { closeTestApp, createTestApp } from '../../app/utils/test'
import { AuthService } from '../../auth/services'
import { ClientService } from '../../client/services'
import { QuizService } from '../services'

const multiChoiceQuestion: QuestionMultiChoiceDto = {
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
}

const rangeQuestion: QuestionRangeDto = {
  type: QuestionType.Range,
  question: 'Guess the temperature of the hottest day ever recorded.',
  media: {
    type: MediaType.Image,
    url: 'https://example.com/question-image.png',
  },
  min: 0,
  max: 100,
  correct: 50,
  margin: QuestionRangeAnswerMargin.Medium,
  points: 1000,
  duration: 30,
}

const trueFalseQuestion: QuestionTrueFalseDto = {
  type: QuestionType.TrueFalse,
  question: 'The earth is flat.',
  media: {
    type: MediaType.Image,
    url: 'https://example.com/question-image.png',
  },
  correct: false,
  points: 1000,
  duration: 30,
}

const typeAnswerQuestion: QuestionTypeAnswerDto = {
  type: QuestionType.TypeAnswer,
  question: 'What is the capital of Denmark?',
  media: {
    type: MediaType.Image,
    url: 'https://example.com/question-image.png',
  },
  options: ['Copenhagen'],
  points: 1000,
  duration: 30,
}

const zeroToOneHundredRangeQuestion: QuestionZeroToOneHundredRangeDto = {
  type: QuestionType.Range,
  question: 'Guess the temperature of the hottest day ever recorded.',
  media: {
    type: MediaType.Image,
    url: 'https://example.com/question-image.png',
  },
  correct: 50,
  duration: 30,
}

const originalData: QuizRequestDto = {
  title: 'Trivia Battle',
  description: 'A fun and engaging trivia quiz for all ages.',
  mode: GameMode.Classic,
  visibility: QuizVisibility.Public,
  category: QuizCategory.GeneralKnowledge,
  imageCoverURL: 'https://example.com/question-cover-image.png',
  languageCode: LanguageCode.English,
  questions: [
    multiChoiceQuestion,
    rangeQuestion,
    trueFalseQuestion,
    typeAnswerQuestion,
  ],
}

const updatedData: QuizRequestDto = {
  title: 'Updated Trivia Battle',
  description: 'A fun and engaging updated trivia quiz for all ages.',
  mode: GameMode.ZeroToOneHundred,
  visibility: QuizVisibility.Private,
  category: QuizCategory.GeneralKnowledge,
  imageCoverURL: 'https://example.com/updated-question-cover-image.png',
  languageCode: LanguageCode.Swedish,
  questions: [zeroToOneHundredRangeQuestion],
}

describe('QuizController (e2e)', () => {
  let app: INestApplication
  let authService: AuthService
  let quizService: QuizService
  let clientService: ClientService

  beforeEach(async () => {
    app = await createTestApp()
    authService = app.get(AuthService)
    quizService = app.get(QuizService)
    clientService = app.get(ClientService)
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

  describe('/api/quizzes (POST)', () => {
    it('should succeed in creating a new quiz', async () => {
      const clientId = uuidv4()

      const { token } = await authService.authenticate({ clientId })

      return supertest(app.getHttpServer())
        .post('/api/quizzes')
        .set({ Authorization: `Bearer ${token}` })
        .send(originalData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
          expect(res.body).toHaveProperty('title', originalData.title)
          expect(res.body).toHaveProperty(
            'description',
            originalData.description,
          )
          expect(res.body).toHaveProperty('visibility', originalData.visibility)
          expect(res.body).toHaveProperty('category', originalData.category)
          expect(res.body).toHaveProperty(
            'imageCoverURL',
            originalData.imageCoverURL,
          )
          expect(res.body).toHaveProperty(
            'languageCode',
            originalData.languageCode,
          )
          expect(res.body).toHaveProperty('created')
          expect(res.body).toHaveProperty('updated')
        })
    })
  })

  describe('/api/quizzes (GET)', () => {
    it('should return a paginated list of public quizzes', async () => {
      const clientId = uuidv4()

      const client = await clientService.findOrCreateClient(clientId)

      const { token } = await authService.authenticate({ clientId })

      const publicQuizzes: QuizResponseDto[] = []
      for (let i = 0; i < 10; i++) {
        publicQuizzes.push(
          await quizService.createQuiz(originalData, client.player),
        )
      }

      await Promise.all(
        [...Array(5).keys()].map(() =>
          quizService.createQuiz(
            { ...originalData, visibility: QuizVisibility.Private },
            client.player,
          ),
        ),
      )

      const allResultsSortedByCreatedDate = publicQuizzes
        .sort((a, b) => b.created.getTime() - a.created.getTime())
        .map((quiz) => JSON.parse(JSON.stringify(quiz)))

      return supertest(app.getHttpServer())
        .get('/api/quizzes')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            results: allResultsSortedByCreatedDate,
            total: 10,
            limit: 10,
            offset: 0,
          })
        })
    })

    it('should return quizzes filtered by search term', async () => {
      const clientId = uuidv4()

      const client = await clientService.findOrCreateClient(clientId)

      const { token } = await authService.authenticate({ clientId })

      await Promise.all([
        ...[...Array(10).keys()].map(() =>
          quizService.createQuiz({ ...originalData }, client.player),
        ),
      ])

      const uniqueQuiz = await quizService.createQuiz(
        { ...originalData, title: 'Unique Quiz Title' },
        client.player,
      )

      const uniqueQuizTitleResultsSortedByCreatedDate = [uniqueQuiz].map(
        (quiz) => JSON.parse(JSON.stringify(quiz)),
      )

      return supertest(app.getHttpServer())
        .get('/api/quizzes?search=Unique%20Quiz%20Title')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            results: uniqueQuizTitleResultsSortedByCreatedDate,
            total: 1,
            limit: 10,
            offset: 0,
          })
        })
    })

    it('should return quizzes filtered by mode', async () => {
      const clientId = uuidv4()

      const client = await clientService.findOrCreateClient(clientId)

      const { token } = await authService.authenticate({ clientId })

      await Promise.all(
        [...Array(10).keys()].map(() =>
          quizService.createQuiz({ ...originalData }, client.player),
        ),
      )

      const zeroToOneHundredQuizzes: QuizResponseDto[] = []
      for (let i = 0; i < 10; i++) {
        zeroToOneHundredQuizzes.push(
          await quizService.createQuiz(
            { ...updatedData, visibility: QuizVisibility.Public },
            client.player,
          ),
        )
      }

      const zeroToOneHundredModeResultsSortedByCreatedDate =
        zeroToOneHundredQuizzes
          .filter((quiz) => quiz.mode === GameMode.ZeroToOneHundred)
          .sort((a, b) => b.created.getTime() - a.created.getTime())
          .map((quiz) => JSON.parse(JSON.stringify(quiz)))

      return supertest(app.getHttpServer())
        .get('/api/quizzes?mode=ZERO_TO_ONE_HUNDRED')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            results: zeroToOneHundredModeResultsSortedByCreatedDate,
            total: 10,
            limit: 10,
            offset: 0,
          })
        })
    })

    it('should return quizzes sort by updated in ascending order', async () => {
      const clientId = uuidv4()

      const client = await clientService.findOrCreateClient(clientId)

      const { token } = await authService.authenticate({ clientId })

      const publicQuizzes: QuizResponseDto[] = []
      for (let i = 0; i < 10; i++) {
        publicQuizzes.push(
          await quizService.createQuiz(originalData, client.player),
        )
      }

      const allResultsSortedByUpdatedAscendingDate = publicQuizzes
        .sort((a, b) => a.updated.getTime() - b.updated.getTime())
        .map((quiz) => JSON.parse(JSON.stringify(quiz)))

      return supertest(app.getHttpServer())
        .get('/api/quizzes?sort=updated&order=asc')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            results: allResultsSortedByUpdatedAscendingDate,
            total: 10,
            limit: 10,
            offset: 0,
          })
        })
    })

    it('should return the correct number of quizzes based on the limit', async () => {
      const clientId = uuidv4()

      const client = await clientService.findOrCreateClient(clientId)

      const { token } = await authService.authenticate({ clientId })

      const publicQuizzes: QuizResponseDto[] = []
      for (let i = 0; i < 10; i++) {
        publicQuizzes.push(
          await quizService.createQuiz(originalData, client.player),
        )
      }

      const firstFiveResultsSortedByCreatedDate = publicQuizzes
        .sort((a, b) => b.created.getTime() - a.created.getTime())
        .filter((_, index) => index >= 0 && index < 5)
        .map((quiz) => JSON.parse(JSON.stringify(quiz)))

      return supertest(app.getHttpServer())
        .get('/api/quizzes?limit=5')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            results: firstFiveResultsSortedByCreatedDate,
            total: 10,
            limit: 5,
            offset: 0,
          })
        })
    })

    it('should return quizzes with the correct offset', async () => {
      const clientId = uuidv4()

      const client = await clientService.findOrCreateClient(clientId)

      const { token } = await authService.authenticate({ clientId })

      const publicQuizzes: QuizResponseDto[] = []
      for (let i = 0; i < 10; i++) {
        publicQuizzes.push(
          await quizService.createQuiz(originalData, client.player),
        )
      }

      const secondFiveResultsSortedByCreatedDate = publicQuizzes
        .sort((a, b) => b.created.getTime() - a.created.getTime())
        .filter((_, index) => index >= 5 && index < 10)
        .map((quiz) => JSON.parse(JSON.stringify(quiz)))

      return supertest(app.getHttpServer())
        .get('/api/quizzes?limit=5&offset=5')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            results: secondFiveResultsSortedByCreatedDate,
            total: 10,
            limit: 5,
            offset: 5,
          })
        })
    })

    it('should return an empty list when no quizzes exists', async () => {
      const clientId = uuidv4()

      const { token } = await authService.authenticate({ clientId })

      return supertest(app.getHttpServer())
        .get('/api/quizzes')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            results: [],
            total: 0,
            limit: 10,
            offset: 0,
          })
        })
    })

    it('should return a 401 error when the request is unauthorized', async () => {
      return supertest(app.getHttpServer())
        .get('/api/quizzes')
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Unauthorized',
            status: 401,
            timestamp: expect.anything(),
          })
        })
    })

    it('should validate query parameters and return a 400 error for invalid input', async () => {
      const clientId = uuidv4()

      const { token } = await authService.authenticate({ clientId })

      return supertest(app.getHttpServer())
        .get('/api/quizzes?limit=X&offset=X&mode=X&sort=X&order=X')
        .set({ Authorization: `Bearer ${token}` })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            status: 400,
            timestamp: expect.anything(),
            validationErrors: [
              {
                constraints: {
                  isEnum:
                    'mode must be one of the following values: CLASSIC, ZERO_TO_ONE_HUNDRED',
                },
                property: 'mode',
              },
              {
                constraints: {
                  isEnum:
                    'sort must be one of the following values: title, created, updated',
                },
                property: 'sort',
              },
              {
                constraints: {
                  isEnum:
                    'order must be one of the following values: asc, desc',
                },
                property: 'order',
              },
              {
                constraints: {
                  isInt: 'limit must be an integer number',
                  max: 'limit must not be greater than 50',
                  min: 'limit must not be less than 5',
                },
                property: 'limit',
              },
              {
                constraints: {
                  isInt: 'offset must be an integer number',
                  min: 'offset must not be less than 0',
                },
                property: 'offset',
              },
            ],
          })
        })
    })
  })

  describe('/api/quizzes/:quizId (GET)', () => {
    it('should succeed in retrieving an existing quiz', async () => {
      const clientId = uuidv4()

      const client = await clientService.findOrCreateClient(clientId)

      const { token } = await authService.authenticate({ clientId })

      const originalQuiz = await quizService.createQuiz(
        originalData,
        client.player,
      )

      return supertest(app.getHttpServer())
        .get(`/api/quizzes/${originalQuiz.id}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', originalQuiz.id)
          expect(res.body).toHaveProperty('title', originalData.title)
          expect(res.body).toHaveProperty(
            'description',
            originalData.description,
          )
          expect(res.body).toHaveProperty('mode')
          expect(res.body).toHaveProperty('visibility', originalData.visibility)
          expect(res.body).toHaveProperty('category', originalData.category)
          expect(res.body).toHaveProperty(
            'imageCoverURL',
            originalData.imageCoverURL,
          )
          expect(res.body).toHaveProperty(
            'languageCode',
            originalData.languageCode,
          )
          expect(res.body).toHaveProperty(
            'created',
            originalQuiz.created.toISOString(),
          )
          expect(res.body).toHaveProperty(
            'updated',
            originalQuiz.updated.toISOString(),
          )
        })
    })

    it('should fail in retrieving a non existing quiz', async () => {
      const clientId = uuidv4()
      const quizId = uuidv4()

      const { token } = await authService.authenticate({ clientId })

      return supertest(app.getHttpServer())
        .get(`/api/quizzes/${quizId}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            `Quiz was not found by id '${quizId}'`,
          )
          expect(res.body).toHaveProperty('status', 404)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should succeed in retrieving a public quiz', async () => {
      const client = await clientService.findOrCreateClient(uuidv4())
      const {
        id,
        title,
        description,
        mode,
        visibility,
        languageCode,
        category,
        imageCoverURL,
        created,
        updated,
      } = await quizService.createQuiz(originalData, client.player)

      const { token } = await authService.authenticate({ clientId: uuidv4() })

      return supertest(app.getHttpServer())
        .get(`/api/quizzes/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id,
            title,
            description,
            mode,
            visibility,
            languageCode,
            category,
            imageCoverURL,
            numberOfQuestions: originalData.questions.length,
            author: {
              id: client.player._id,
              name: client.player.nickname,
            },
            created: created.toISOString(),
            updated: updated.toISOString(),
          })
        })
    })

    it('should fail in retrieving a private quiz', async () => {
      const client = await clientService.findOrCreateClient(uuidv4())
      const { id } = await quizService.createQuiz(
        { ...originalData, visibility: QuizVisibility.Private },
        client.player,
      )

      const { token } = await authService.authenticate({ clientId: uuidv4() })

      return supertest(app.getHttpServer())
        .get(`/api/quizzes/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(403)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Forbidden')
          expect(res.body).toHaveProperty('status', 403)
          expect(res.body).toHaveProperty('timestamp')
        })
    })
  })

  describe('/api/quizzes/:quizId (PUT)', () => {
    it('should succeed in updating an existing quiz', async () => {
      const clientId = uuidv4()

      const client = await clientService.findOrCreateClient(clientId)

      const { token } = await authService.authenticate({ clientId })

      const originalQuiz = await quizService.createQuiz(
        originalData,
        client.player,
      )

      return supertest(app.getHttpServer())
        .put(`/api/quizzes/${originalQuiz.id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send(updatedData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', originalQuiz.id)
          expect(res.body).toHaveProperty('title', updatedData.title)
          expect(res.body).toHaveProperty(
            'description',
            updatedData.description,
          )
          expect(res.body).toHaveProperty('visibility', updatedData.visibility)
          expect(res.body).toHaveProperty('category', originalData.category)
          expect(res.body).toHaveProperty(
            'imageCoverURL',
            updatedData.imageCoverURL,
          )
          expect(res.body).toHaveProperty(
            'languageCode',
            updatedData.languageCode,
          )
          expect(res.body).toHaveProperty(
            'created',
            originalQuiz.created.toISOString(),
          )
          expect(res.body).toHaveProperty('updated')
        })
    })

    it('should fail in updating a non existing quiz', async () => {
      const clientId = uuidv4()
      const quizId = uuidv4()

      const { token } = await authService.authenticate({ clientId })

      return supertest(app.getHttpServer())
        .put(`/api/quizzes/${quizId}`)
        .set({ Authorization: `Bearer ${token}` })
        .send(updatedData)
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            `Quiz was not found by id '${quizId}'`,
          )
          expect(res.body).toHaveProperty('status', 404)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should fail in updating a non authorized quiz', async () => {
      const client = await clientService.findOrCreateClient(uuidv4())
      const { id } = await quizService.createQuiz(originalData, client.player)

      const { token } = await authService.authenticate({ clientId: uuidv4() })

      return supertest(app.getHttpServer())
        .put(`/api/quizzes/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send(updatedData)
        .expect(403)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Forbidden')
          expect(res.body).toHaveProperty('status', 403)
          expect(res.body).toHaveProperty('timestamp')
        })
    })
  })

  describe('/api/quizzes/:quizId (DELETE)', () => {
    it('should succeed in deleting an existing quiz', async () => {
      const clientId = uuidv4()

      const client = await clientService.findOrCreateClient(clientId)

      const { token } = await authService.authenticate({ clientId })

      const originalQuiz = await quizService.createQuiz(
        originalData,
        client.player,
      )

      return supertest(app.getHttpServer())
        .delete(`/api/quizzes/${originalQuiz.id}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should fail in deleting a non existing quiz', async () => {
      const clientId = uuidv4()
      const quizId = uuidv4()

      const { token } = await authService.authenticate({ clientId })

      return supertest(app.getHttpServer())
        .delete(`/api/quizzes/${quizId}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            `Quiz was not found by id '${quizId}'`,
          )
          expect(res.body).toHaveProperty('status', 404)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should fail in deleting a non authorized quiz', async () => {
      const client = await clientService.findOrCreateClient(uuidv4())
      const { id } = await quizService.createQuiz(originalData, client.player)

      const { token } = await authService.authenticate({ clientId: uuidv4() })

      return supertest(app.getHttpServer())
        .delete(`/api/quizzes/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(403)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Forbidden')
          expect(res.body).toHaveProperty('status', 403)
          expect(res.body).toHaveProperty('timestamp')
        })
    })
  })

  describe('/api/quizzes/:quizId/questions (GET)', () => {
    it('should succeed in retrieving all questions for a classic mode quiz', async () => {
      const clientId = uuidv4()

      const client = await clientService.findOrCreateClient(clientId)

      const { token } = await authService.authenticate({ clientId })

      const quiz = await quizService.createQuiz(originalData, client.player)

      return supertest(app.getHttpServer())
        .get(`/api/quizzes/${quiz.id}/questions`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(originalData.questions)
        })
    })

    it('should succeed in retrieving all questions for a zero to one hundred mode quiz', async () => {
      const clientId = uuidv4()

      const client = await clientService.findOrCreateClient(clientId)

      const { token } = await authService.authenticate({ clientId })

      const quiz = await quizService.createQuiz(updatedData, client.player)

      return supertest(app.getHttpServer())
        .get(`/api/quizzes/${quiz.id}/questions`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(updatedData.questions)
        })
    })

    it('should fail in retrieving all questions for a non existing quiz', async () => {
      const unknownQuizId = uuidv4()

      const { token } = await authService.authenticate({ clientId: uuidv4() })

      return supertest(app.getHttpServer())
        .get(`/api/quizzes/${unknownQuizId}/questions`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            `Quiz was not found by id '${unknownQuizId}'`,
          )
          expect(res.body).toHaveProperty('status', 404)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should fail in retrieving all questions for a non authorized quiz', async () => {
      const clientId = uuidv4()

      const client = await clientService.findOrCreateClient(clientId)

      const quiz = await quizService.createQuiz(originalData, client.player)

      const { token } = await authService.authenticate({ clientId: uuidv4() })

      return supertest(app.getHttpServer())
        .get(`/api/quizzes/${quiz.id}/questions`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(403)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Forbidden')
          expect(res.body).toHaveProperty('status', 403)
          expect(res.body).toHaveProperty('timestamp')
        })
    })
  })
})
