import { INestApplication } from '@nestjs/common'
import {
  LanguageCode,
  MediaType,
  QuestionMultiChoiceRequestDto,
  QuestionRangeAnswerMargin,
  QuestionRangeRequestDto,
  QuestionTrueFalseRequestDto,
  QuestionType,
  QuestionTypeAnswerRequestDto,
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

const updateMultiChoiceQuestionRequest: QuestionMultiChoiceRequestDto = {
  type: QuestionType.MultiChoice,
  question: 'What is the capital of Denmark?',
  media: {
    type: MediaType.Video,
    url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
  },
  options: [
    {
      value: 'Copenhagen',
      correct: true,
    },
    {
      value: 'Stockholm',
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
  points: 2000,
  duration: 60,
}

const createRangeQuestionRequest: QuestionRangeRequestDto = {
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

const updateRangeQuestionRequest: QuestionRangeRequestDto = {
  type: QuestionType.Range,
  question: "According to the Bible, how many people were on board Noah's Ark?",
  media: {
    type: MediaType.Video,
    url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
  },
  min: 100,
  max: 1000,
  correct: 500,
  margin: QuestionRangeAnswerMargin.Low,
  points: 2000,
  duration: 60,
}

const createTrueFalseQuestionRequest: QuestionTrueFalseRequestDto = {
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

const updateTrueFalseQuestionRequest: QuestionTrueFalseRequestDto = {
  type: QuestionType.TrueFalse,
  question: 'The earth is not flat.',
  media: {
    type: MediaType.Video,
    url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
  },
  correct: true,
  points: 2000,
  duration: 60,
}

const createTypeAnswerQuestionRequest: QuestionTypeAnswerRequestDto = {
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

const updateTypeAnswerQuestionRequest: QuestionTypeAnswerRequestDto = {
  type: QuestionType.TypeAnswer,
  question: 'What is the capital of Denmark?',
  media: {
    type: MediaType.Video,
    url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
  },
  options: [
    {
      value: 'Copenhagen',
      correct: true,
    },
    {
      value: 'Stockholm',
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
  points: 2000,
  duration: 60,
}

describe('QuestionController (e2e)', () => {
  let app: INestApplication
  let authService: AuthService
  let quizService: QuizService
  let clientService: ClientService
  let questionService: QuestionService

  let clientId: string
  let client: Client
  let quiz: QuizResponseDto
  let token: string

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

  describe('/api/questions/:questionId (GET)', () => {
    it('should succeed in retrieving an existing multi choice question', async () => {
      const { id, created, updated } = await questionService.createQuestion(
        quiz.id,
        createMultiChoiceQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .get(`/api/questions/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id,
            ...createMultiChoiceQuestionRequest,
            created: created.toISOString(),
            updated: updated.toISOString(),
          })
        })
    })

    it('should succeed in retrieving an existing range question', async () => {
      const { id, created, updated } = await questionService.createQuestion(
        quiz.id,
        createRangeQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .get(`/api/questions/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id,
            ...createRangeQuestionRequest,
            created: created.toISOString(),
            updated: updated.toISOString(),
          })
        })
    })

    it('should succeed in retrieving an existing true false question', async () => {
      const { id, created, updated } = await questionService.createQuestion(
        quiz.id,
        createTrueFalseQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .get(`/api/questions/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id,
            ...createTrueFalseQuestionRequest,
            created: created.toISOString(),
            updated: updated.toISOString(),
          })
        })
    })

    it('should succeed in retrieving an existing type answer question', async () => {
      const { id, created, updated } = await questionService.createQuestion(
        quiz.id,
        createTypeAnswerQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .get(`/api/questions/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id,
            ...createTypeAnswerQuestionRequest,
            created: created.toISOString(),
            updated: updated.toISOString(),
          })
        })
    })

    it('should fail in retrieving a non existing question', async () => {
      const unknownQuestionId = uuidv4()

      return supertest(app.getHttpServer())
        .get(`/api/questions/${unknownQuestionId}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            `Question was not found by id '${unknownQuestionId}'`,
          )
          expect(res.body).toHaveProperty('status', 404)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should fail in retrieving an existing multi choice question for a non authorized quiz', async () => {
      const { id } = await questionService.createQuestion(
        quiz.id,
        createMultiChoiceQuestionRequest,
      )

      const { token } = await authService.authenticate({ clientId: uuidv4() })

      return supertest(app.getHttpServer())
        .get(`/api/questions/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(403)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Forbidden')
          expect(res.body).toHaveProperty('status', 403)
          expect(res.body).toHaveProperty('timestamp')
        })
    })
  })

  describe('/api/questions/:questionId (PUT)', () => {
    it('should succeed in updating an existing multi choice question', async () => {
      const { id, created } = await questionService.createQuestion(
        quiz.id,
        createMultiChoiceQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .put(`/api/questions/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send(updateMultiChoiceQuestionRequest)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id,
            ...updateMultiChoiceQuestionRequest,
            created: created.toISOString(),
            updated: expect.anything(),
          })
        })
    })

    it('should fail in updating an existing multi choice question without a payload', async () => {
      const { id } = await questionService.createQuestion(
        quiz.id,
        updateMultiChoiceQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .put(`/api/questions/${id}`)
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

    it('should succeed in updating an existing range question', async () => {
      const { id, created } = await questionService.createQuestion(
        quiz.id,
        createRangeQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .put(`/api/questions/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send(updateRangeQuestionRequest)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id,
            ...updateRangeQuestionRequest,
            created: created.toISOString(),
            updated: expect.anything(),
          })
        })
    })

    it('should fail in updating an existing range question without a payload', async () => {
      const { id } = await questionService.createQuestion(
        quiz.id,
        createRangeQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .put(`/api/questions/${id}`)
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

    it('should succeed in updating an existing true false question', async () => {
      const { id, created } = await questionService.createQuestion(
        quiz.id,
        createTrueFalseQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .put(`/api/questions/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send(updateTrueFalseQuestionRequest)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id,
            ...updateTrueFalseQuestionRequest,
            created: created.toISOString(),
            updated: expect.anything(),
          })
        })
    })

    it('should fail in updating an existing true false question without a payload', async () => {
      const { id } = await questionService.createQuestion(
        quiz.id,
        createTrueFalseQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .put(`/api/questions/${id}`)
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

    it('should succeed in updating an existing type answer question', async () => {
      const { id, created } = await questionService.createQuestion(
        quiz.id,
        createTypeAnswerQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .put(`/api/questions/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send(updateTypeAnswerQuestionRequest)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id,
            ...updateTypeAnswerQuestionRequest,
            created: created.toISOString(),
            updated: expect.anything(),
          })
        })
    })

    it('should fail in updating an existing type answer question without a payload', async () => {
      const { id } = await questionService.createQuestion(
        quiz.id,
        createTypeAnswerQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .put(`/api/questions/${id}`)
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

    it('should fail in updating an existing question without a payload', async () => {
      const { id } = await questionService.createQuestion(
        quiz.id,
        createTypeAnswerQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .put(`/api/questions/${id}`)
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

    it('should fail in updating a non existing question', async () => {
      const unknownQuestionId = uuidv4()

      return supertest(app.getHttpServer())
        .put(`/api/questions/${unknownQuestionId}`)
        .set({ Authorization: `Bearer ${token}` })
        .send(updateMultiChoiceQuestionRequest)
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            `Question was not found by id '${unknownQuestionId}'`,
          )
          expect(res.body).toHaveProperty('status', 404)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should fail in updating an existing multi choice question for a non authorized quiz', async () => {
      const { id } = await questionService.createQuestion(
        quiz.id,
        createMultiChoiceQuestionRequest,
      )

      const { token } = await authService.authenticate({ clientId: uuidv4() })

      return supertest(app.getHttpServer())
        .put(`/api/questions/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send(updateMultiChoiceQuestionRequest)
        .expect(403)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Forbidden')
          expect(res.body).toHaveProperty('status', 403)
          expect(res.body).toHaveProperty('timestamp')
        })
    })
  })

  describe('/api/questions/:questionId (DELETE)', () => {
    it('should succeed in deleting an existing multi choice question', async () => {
      const { id } = await questionService.createQuestion(
        quiz.id,
        createMultiChoiceQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .delete(`/api/questions/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should succeed in deleting an existing range question', async () => {
      const { id } = await questionService.createQuestion(
        quiz.id,
        createRangeQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .delete(`/api/questions/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should succeed in deleting an existing true false question', async () => {
      const { id } = await questionService.createQuestion(
        quiz.id,
        createTrueFalseQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .delete(`/api/questions/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should succeed in deleting an existing type answer question', async () => {
      const { id } = await questionService.createQuestion(
        quiz.id,
        createTypeAnswerQuestionRequest,
      )

      return supertest(app.getHttpServer())
        .delete(`/api/questions/${id}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should fail in deleting a non existing question', async () => {
      const unknownQuestionId = uuidv4()

      return supertest(app.getHttpServer())
        .delete(`/api/questions/${unknownQuestionId}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            `Question was not found by id '${unknownQuestionId}'`,
          )
          expect(res.body).toHaveProperty('status', 404)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should fail in deleting an existing multi choice question for a non authorized quiz', async () => {
      const { id } = await questionService.createQuestion(
        quiz.id,
        createMultiChoiceQuestionRequest,
      )

      const { token } = await authService.authenticate({ clientId: uuidv4() })

      return supertest(app.getHttpServer())
        .delete(`/api/questions/${id}`)
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
