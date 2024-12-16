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
import { QuizService } from '../../quiz/services'

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

const classicQuizRequest: QuizRequestDto = {
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

const zeroToOneHundredQuizRequest: QuizRequestDto = {
  title: 'Updated Trivia Battle',
  description: 'A fun and engaging updated trivia quiz for all ages.',
  mode: GameMode.ZeroToOneHundred,
  visibility: QuizVisibility.Private,
  imageCoverURL: 'https://example.com/updated-question-cover-image.png',
  languageCode: LanguageCode.Swedish,
  questions: [zeroToOneHundredRangeQuestion],
}

describe('QuizGameController (e2e)', () => {
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

  describe('/api/quizzes/:quizId/games (POST)', () => {
    it('should succeed in creating a new game from an existing classic mode quiz', async () => {
      const clientId = uuidv4()

      const client = await clientService.findOrCreateClient(clientId)

      const { token } = await authService.authenticate({ clientId })

      const originalQuiz = await quizService.createQuiz(
        classicQuizRequest,
        client.player,
      )

      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${originalQuiz.id}/games`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
        })
    })

    it('should succeed in creating a new game from an existing zero-to-one-hundred mode quiz', async () => {
      const clientId = uuidv4()

      const client = await clientService.findOrCreateClient(clientId)

      const { token } = await authService.authenticate({ clientId })

      const originalQuiz = await quizService.createQuiz(
        zeroToOneHundredQuizRequest,
        client.player,
      )

      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${originalQuiz.id}/games`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
        })
    })

    it('should fail in creating a new game from a non existing quiz', async () => {
      const clientId = uuidv4()
      const quizId = uuidv4()

      const { token } = await authService.authenticate({ clientId })

      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${quizId}/games`)
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

    it('should fail in creating a new game from a non authorized quiz', async () => {
      const client = await clientService.findOrCreateClient(uuidv4())
      const { id } = await quizService.createQuiz(
        classicQuizRequest,
        client.player,
      )

      const { token } = await authService.authenticate({ clientId: uuidv4() })

      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${id}/games`)
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
