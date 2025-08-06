import { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
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
  QuizVisibility,
} from '@quiz/common'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import { buildMockSecondaryUser } from '../../../test-utils/data'
import {
  closeTestApp,
  createDefaultUserAndAuthenticate,
  createTestApp,
} from '../../../test-utils/utils'
import { QuizService } from '../../quiz/services'
import { User, UserModel } from '../../user/repositories'

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

const zeroToOneHundredQuizRequest: QuizRequestDto = {
  title: 'Updated Trivia Battle',
  description: 'A fun and engaging updated trivia quiz for all ages.',
  mode: GameMode.ZeroToOneHundred,
  visibility: QuizVisibility.Private,
  category: QuizCategory.GeneralKnowledge,
  imageCoverURL: 'https://example.com/updated-question-cover-image.png',
  languageCode: LanguageCode.Swedish,
  questions: [zeroToOneHundredRangeQuestion],
}

describe('QuizGameController (e2e)', () => {
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

  describe('/api/quizzes/:quizId/games (POST)', () => {
    it('should succeed in creating a new game from an existing classic mode quiz', async () => {
      const { accessToken, user } = await createDefaultUserAndAuthenticate(app)

      const originalQuiz = await quizService.createQuiz(
        classicQuizRequest,
        user,
      )

      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${originalQuiz.id}/games`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
        })
    })

    it('should succeed in creating a new game from an existing zero-to-one-hundred mode quiz', async () => {
      const { accessToken, user } = await createDefaultUserAndAuthenticate(app)

      const originalQuiz = await quizService.createQuiz(
        zeroToOneHundredQuizRequest,
        user,
      )

      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${originalQuiz.id}/games`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
        })
    })

    it('should fail in creating a new game from a non existing quiz', async () => {
      const quizId = uuidv4()

      const { accessToken } = await createDefaultUserAndAuthenticate(app)

      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${quizId}/games`)
        .set({ Authorization: `Bearer ${accessToken}` })
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

    it('should succeed in creating a new game from public quiz', async () => {
      const anotherUser = await userModel.create(buildMockSecondaryUser())

      const { id } = await quizService.createQuiz(
        { ...classicQuizRequest, visibility: QuizVisibility.Public },
        anotherUser,
      )

      const { accessToken } = await createDefaultUserAndAuthenticate(app)

      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${id}/games`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
        })
    })

    it('should fail in creating a new game from a non authorized quiz', async () => {
      const anotherUser = await userModel.create(buildMockSecondaryUser())

      const { id } = await quizService.createQuiz(
        { ...classicQuizRequest, visibility: QuizVisibility.Private },
        anotherUser,
      )

      const { accessToken } = await createDefaultUserAndAuthenticate(app)

      return supertest(app.getHttpServer())
        .post(`/api/quizzes/${id}/games`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(403)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Forbidden')
          expect(res.body).toHaveProperty('status', 403)
          expect(res.body).toHaveProperty('timestamp')
        })
    })
  })
})
