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
  QuizRequestDto,
  QuizVisibility,
} from '@quiz/common'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import {
  createTestApp,
  initializeMongoMemoryServer,
  stopMongoMemoryServer,
} from '../../app/utils/test'
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
  imageCoverURL: 'https://example.com/updated-question-cover-image.png',
  languageCode: LanguageCode.Swedish,
  questions: [zeroToOneHundredRangeQuestion],
}

describe('QuizController (e2e)', () => {
  let app: INestApplication
  let authService: AuthService
  let quizService: QuizService
  let clientService: ClientService

  beforeAll(async () => {
    await initializeMongoMemoryServer()
  }, 30000)

  afterAll(async () => {
    await stopMongoMemoryServer()
  }, 30000)

  beforeEach(async () => {
    app = await createTestApp()
    authService = app.get(AuthService)
    quizService = app.get(QuizService)
    clientService = app.get(ClientService)
  }, 30000)

  afterEach(async () => {
    await app.close()
  }, 30000)

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

    it('should fail in retrieving a non authorized quiz', async () => {
      const client = await clientService.findOrCreateClient(uuidv4())
      const { id } = await quizService.createQuiz(originalData, client.player)

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
