import { INestApplication } from '@nestjs/common'
import {
  LanguageCode,
  MediaType,
  QuestionMultiChoiceRequestDto,
  QuestionRangeAnswerMargin,
  QuestionType,
  QuizRequestDto,
  QuizResponseDto,
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
import { Client } from '../../client/services/models/schemas'
import { QuestionService, QuizService } from '../services'

const createQuizRequest: QuizRequestDto = {
  title: 'Trivia Battle',
  description: 'A fun and engaging trivia quiz for all ages.',
  visibility: QuizVisibility.Public,
  imageCoverURL: 'https://example.com/question-cover-image.png',
  languageCode: LanguageCode.English,
}

const createMultiChoiceQuestionRequest: QuestionMultiChoiceRequestDto = {
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

const createRangeQuestionRequest = {
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

const createTrueFalseQuestionRequest = {
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

const createTypeAnswerQuestionRequest = {
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

describe('QuizQuestionController (e2e)', () => {
  let app: INestApplication
  let authService: AuthService
  let quizService: QuizService
  let clientService: ClientService
  let questionService: QuestionService

  let clientId: string
  let client: Client
  let token: string
  let quiz: QuizResponseDto

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
    questionService = app.get(QuestionService)

    clientId = uuidv4()
    client = await clientService.findOrCreateClient(clientId)
    quiz = await quizService.createQuiz(createQuizRequest, client.player)
    const authResponse = await authService.authenticate({ clientId })
    token = authResponse.token
  }, 30000)

  afterEach(async () => {
    await app.close()
  }, 30000)

  describe('/api/quizzes/:quizId/questions (POST)', () => {
    it('should succeed in creating a new multi choice question', async () => {
      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${quiz.id}/questions`)
        .set({ Authorization: `Bearer ${token}` })
        .send(createMultiChoiceQuestionRequest)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({
            id: expect.anything(),
            ...createMultiChoiceQuestionRequest,
            created: expect.anything(),
            updated: expect.anything(),
          })
        })
    })

    it('should fail in creating a new multi choice question without a payload', async () => {
      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${quiz.id}/questions`)
        .set({ Authorization: `Bearer ${token}` })
        .send({ type: QuestionType.MultiChoice })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            validationErrors: [
              {
                constraints: {
                  isArray: 'options must be an array',
                },
                property: 'options',
              },
              {
                constraints: {
                  isString: 'question must be a string',
                  maxLength:
                    'question must be shorter than or equal to 120 characters',
                  minLength:
                    'question must be longer than or equal to 3 characters',
                },
                property: 'question',
              },
              {
                constraints: {
                  isIn: 'points must be one of the following values: 0, 1000, 2000',
                  isNumber:
                    'points must be a number conforming to the specified constraints',
                },
                property: 'points',
              },
              {
                constraints: {
                  isIn: 'duration must be one of the following values: 5, 30, 60, 120',
                  isNumber:
                    'duration must be a number conforming to the specified constraints',
                },
                property: 'duration',
              },
            ],
            status: 400,
            timestamp: expect.anything(),
          })
        })
    })

    it('should succeed in creating a new range question', async () => {
      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${quiz.id}/questions`)
        .set({ Authorization: `Bearer ${token}` })
        .send(createRangeQuestionRequest)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({
            id: expect.anything(),
            ...createRangeQuestionRequest,
            created: expect.anything(),
            updated: expect.anything(),
          })
        })
    })

    it('should fail in creating a new range question without a payload', async () => {
      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${quiz.id}/questions`)
        .set({ Authorization: `Bearer ${token}` })
        .send({ type: QuestionType.Range })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            validationErrors: [
              {
                constraints: {
                  isNumber:
                    'min must be a number conforming to the specified constraints',
                  max: 'min must not be greater than 10000',
                  min: 'min must not be less than -10000',
                  minMaxValidator: 'min should not be greater than max',
                },
                property: 'min',
              },
              {
                constraints: {
                  isNumber:
                    'max must be a number conforming to the specified constraints',
                  max: 'max must not be greater than 10000',
                  min: 'max must not be less than -10000',
                  minMaxValidator: 'min should not be greater than max',
                },
                property: 'max',
              },
              {
                constraints: {
                  isEnum:
                    'margin must be one of the following values: NONE, LOW, MEDIUM, HIGH, MAXIMUM',
                },
                property: 'margin',
              },
              {
                constraints: {
                  inRangeValidator:
                    'correct must be within the range of min and max',
                  isNumber:
                    'correct must be a number conforming to the specified constraints',
                  max: 'correct must not be greater than 10000',
                  min: 'correct must not be less than -10000',
                },
                property: 'correct',
              },
              {
                constraints: {
                  isString: 'question must be a string',
                  maxLength:
                    'question must be shorter than or equal to 120 characters',
                  minLength:
                    'question must be longer than or equal to 3 characters',
                },
                property: 'question',
              },
              {
                constraints: {
                  isIn: 'points must be one of the following values: 0, 1000, 2000',
                  isNumber:
                    'points must be a number conforming to the specified constraints',
                },
                property: 'points',
              },
              {
                constraints: {
                  isIn: 'duration must be one of the following values: 5, 30, 60, 120',
                  isNumber:
                    'duration must be a number conforming to the specified constraints',
                },
                property: 'duration',
              },
            ],
            status: 400,
            timestamp: expect.anything(),
          })
        })
    })

    it('should succeed in creating a new true false question', async () => {
      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${quiz.id}/questions`)
        .set({ Authorization: `Bearer ${token}` })
        .send(createTrueFalseQuestionRequest)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({
            id: expect.anything(),
            ...createTrueFalseQuestionRequest,
            created: expect.anything(),
            updated: expect.anything(),
          })
        })
    })

    it('should fail in creating a new true false question without a payload', async () => {
      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${quiz.id}/questions`)
        .set({ Authorization: `Bearer ${token}` })
        .send({ type: QuestionType.TrueFalse })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            validationErrors: [
              {
                constraints: {
                  isBoolean: 'correct must be a boolean value',
                },
                property: 'correct',
              },
              {
                constraints: {
                  isString: 'question must be a string',
                  maxLength:
                    'question must be shorter than or equal to 120 characters',
                  minLength:
                    'question must be longer than or equal to 3 characters',
                },
                property: 'question',
              },
              {
                constraints: {
                  isIn: 'points must be one of the following values: 0, 1000, 2000',
                  isNumber:
                    'points must be a number conforming to the specified constraints',
                },
                property: 'points',
              },
              {
                constraints: {
                  isIn: 'duration must be one of the following values: 5, 30, 60, 120',
                  isNumber:
                    'duration must be a number conforming to the specified constraints',
                },
                property: 'duration',
              },
            ],
            status: 400,
            timestamp: expect.anything(),
          })
        })
    })

    it('should succeed in creating a new type answer question', async () => {
      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${quiz.id}/questions`)
        .set({ Authorization: `Bearer ${token}` })
        .send(createTypeAnswerQuestionRequest)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({
            id: expect.anything(),
            ...createTypeAnswerQuestionRequest,
            created: expect.anything(),
            updated: expect.anything(),
          })
        })
    })

    it('should fail in creating a new type answer question without a payload', async () => {
      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${quiz.id}/questions`)
        .set({ Authorization: `Bearer ${token}` })
        .send({ type: QuestionType.TypeAnswer })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            validationErrors: [
              {
                constraints: {
                  isArray: 'options must be an array',
                },
                property: 'options',
              },
              {
                constraints: {
                  isString: 'question must be a string',
                  maxLength:
                    'question must be shorter than or equal to 120 characters',
                  minLength:
                    'question must be longer than or equal to 3 characters',
                },
                property: 'question',
              },
              {
                constraints: {
                  isIn: 'points must be one of the following values: 0, 1000, 2000',
                  isNumber:
                    'points must be a number conforming to the specified constraints',
                },
                property: 'points',
              },
              {
                constraints: {
                  isIn: 'duration must be one of the following values: 5, 30, 60, 120',
                  isNumber:
                    'duration must be a number conforming to the specified constraints',
                },
                property: 'duration',
              },
            ],
            status: 400,
            timestamp: expect.anything(),
          })
        })
    })

    it('should fail in creating a question without a payload', async () => {
      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${quiz.id}/questions`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            status: 400,
            timestamp: expect.anything(),
          })
        })
    })

    it('should fail in creating a new question for a non authorized quiz', async () => {
      const { token } = await authService.authenticate({ clientId: uuidv4() })

      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${quiz.id}/questions`)
        .set({ Authorization: `Bearer ${token}` })
        .send(createMultiChoiceQuestionRequest)
        .expect(403)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Forbidden')
          expect(res.body).toHaveProperty('status', 403)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should fail in creating a new question for a non existing quiz', async () => {
      const quizId = uuidv4()

      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${quizId}/questions`)
        .set({ Authorization: `Bearer ${token}` })
        .send(createMultiChoiceQuestionRequest)
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
  })

  describe('/api/quizzes/:quizId/questions (GET)', () => {
    it('should succeed in retrieving all questions for a quiz', async () => {
      const question = await questionService.createQuestion(
        quiz.id,
        createMultiChoiceQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .get(`/api/quizzes/${quiz.id}/questions`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([
            {
              id: question.id,
              ...createMultiChoiceQuestionRequest,
              created: question.created.toISOString(),
              updated: question.updated.toISOString(),
            },
          ])
        })
    })

    it('should fail in retrieving all questions for a non existing quiz', async () => {
      const unknownQuizId = uuidv4()

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
