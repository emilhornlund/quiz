import { GameStatus } from '@klurigo/common'
import { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import supertest from 'supertest'

import {
  buildMockPrimaryUser,
  buildMockQuizRating,
  buildMockSecondaryUser,
  createMockClassicQuiz,
  createMockGameDocument,
  createMockGameHostParticipantDocument,
  createMockGamePlayerParticipantDocument,
} from '../../../../test-utils/data'
import {
  closeTestApp,
  createDefaultUserAndAuthenticate,
  createTestApp,
} from '../../../../test-utils/utils'
import { Game, GameModel } from '../../game-core/repositories/models/schemas'
import {
  Quiz,
  QuizModel,
  QuizRating,
  QuizRatingModel,
} from '../../quiz-core/repositories/models/schemas'
import { User } from '../../user/repositories'

import { ProfileQuizRatingController } from './profile-quiz-rating.controller'

describe(`${ProfileQuizRatingController.name} (e2e)`, () => {
  let app: INestApplication
  let gameModel: GameModel
  let quizModel: QuizModel
  let quizRatingModel: QuizRatingModel

  beforeEach(async () => {
    app = await createTestApp()
    gameModel = app.get<GameModel>(getModelToken(Game.name))
    quizModel = app.get<QuizModel>(getModelToken(Quiz.name))
    quizRatingModel = app.get<QuizRatingModel>(getModelToken(QuizRating.name))
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

  describe('/api/profile/quizzes/:quizId/ratings (PUT)', () => {
    let gameParticipantHostUserAccessToken: string

    let gameParticipantPlayerUser: User
    let gameParticipantPlayerUserAccessToken: string

    let quiz: Quiz

    const stars = 5
    const comment = 'Great quiz—good pacing and fun questions.'

    const defaultDate = new Date('2025-01-01T12:00:00.000Z')

    beforeEach(async () => {
      const primaryAuthenticatedUser = await createDefaultUserAndAuthenticate(
        app,
        buildMockPrimaryUser(),
      )
      gameParticipantHostUserAccessToken = primaryAuthenticatedUser.accessToken

      const secondaryAuthenticatedUser = await createDefaultUserAndAuthenticate(
        app,
        buildMockSecondaryUser(),
      )
      gameParticipantPlayerUser = secondaryAuthenticatedUser.user
      gameParticipantPlayerUserAccessToken =
        secondaryAuthenticatedUser.accessToken

      quiz = await quizModel.create(
        createMockClassicQuiz({
          owner: primaryAuthenticatedUser.user,
        }),
      )

      await gameModel.create(
        createMockGameDocument({
          quiz,
          participants: [
            createMockGameHostParticipantDocument({
              participantId: primaryAuthenticatedUser.user._id,
            }),
            createMockGamePlayerParticipantDocument({
              participantId: secondaryAuthenticatedUser.user._id,
              nickname: gameParticipantPlayerUser.defaultNickname,
            }),
          ],
          status: GameStatus.Completed,
        }),
      )
    })

    it('should create a rating when caller is a player participant', () => {
      return supertest(app.getHttpServer())
        .put(`/api/profile/quizzes/${quiz._id}/ratings`)
        .set({
          Authorization: `Bearer ${gameParticipantPlayerUserAccessToken}`,
        })
        .send({
          stars,
          comment,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: expect.any(String),
            quizId: quiz._id,
            stars,
            comment,
            author: {
              id: gameParticipantPlayerUser._id,
              nickname: gameParticipantPlayerUser.defaultNickname,
            },
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          })
        })
    })

    it('should create a rating without a comment when caller is a player participant', () => {
      return supertest(app.getHttpServer())
        .put(`/api/profile/quizzes/${quiz._id}/ratings`)
        .set({
          Authorization: `Bearer ${gameParticipantPlayerUserAccessToken}`,
        })
        .send({
          stars,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: expect.any(String),
            quizId: quiz._id,
            stars,
            author: {
              id: gameParticipantPlayerUser._id,
              nickname: gameParticipantPlayerUser.defaultNickname,
            },
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          })
        })
    })

    it('should return 403 when caller is a host participant', () => {
      return supertest(app.getHttpServer())
        .put(`/api/profile/quizzes/${quiz._id}/ratings`)
        .set({ Authorization: `Bearer ${gameParticipantHostUserAccessToken}` })
        .send({
          stars,
          comment,
        })
        .expect(403)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Forbidden',
            status: 403,
            timestamp: expect.any(String),
          })
        })
    })

    it('should update the existing rating when caller is the rating author', async () => {
      const quizRating = await quizRatingModel.create(
        buildMockQuizRating({
          quizId: quiz._id,
          author: gameParticipantPlayerUser,
          stars,
          comment,
          created: defaultDate,
          updated: defaultDate,
        }),
      )

      const updatedStars = 3
      const updatedComment = 'Solid, but a couple of questions were tricky.'

      return supertest(app.getHttpServer())
        .put(`/api/profile/quizzes/${quiz._id}/ratings`)
        .set({
          Authorization: `Bearer ${gameParticipantPlayerUserAccessToken}`,
        })
        .send({
          stars: updatedStars,
          comment: updatedComment,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: quizRating._id,
            quizId: quiz._id,
            stars: updatedStars,
            comment: updatedComment,
            author: {
              id: gameParticipantPlayerUser._id,
              nickname: gameParticipantPlayerUser.defaultNickname,
            },
            createdAt: defaultDate.toISOString(),
            updatedAt: expect.any(String),
          })
        })
    })

    it('should update the existing rating and clear the comment when comment is undefined', async () => {
      const quizRating = await quizRatingModel.create(
        buildMockQuizRating({
          quizId: quiz._id,
          author: gameParticipantPlayerUser,
          stars,
          comment,
          created: defaultDate,
          updated: defaultDate,
        }),
      )

      const updatedStars = 3

      return supertest(app.getHttpServer())
        .put(`/api/profile/quizzes/${quiz._id}/ratings`)
        .set({
          Authorization: `Bearer ${gameParticipantPlayerUserAccessToken}`,
        })
        .send({
          stars: updatedStars,
          comment: undefined,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: quizRating._id,
            quizId: quiz._id,
            stars: updatedStars,
            comment: undefined,
            author: {
              id: gameParticipantPlayerUser._id,
              nickname: gameParticipantPlayerUser.defaultNickname,
            },
            createdAt: defaultDate.toISOString(),
            updatedAt: expect.any(String),
          })
        })
    })

    it('should return 400 when payload validation fails', () => {
      return supertest(app.getHttpServer())
        .put(`/api/profile/quizzes/${quiz._id}/ratings`)
        .set({
          Authorization: `Bearer ${gameParticipantPlayerUserAccessToken}`,
        })
        .send({
          stars: 0,
          comment: '',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Validation failed',
            status: 400,
            timestamp: expect.any(String),
            validationErrors: [
              {
                constraints: {
                  min: 'stars must not be less than 1',
                },
                property: 'stars',
              },
              {
                constraints: {
                  matches: 'Comment must not be blank.',
                  minLength:
                    'comment must be longer than or equal to 1 characters',
                },
                property: 'comment',
              },
            ],
          })
        })
    })

    it('should return 401 when Authorization header is missing', async () => {
      return supertest(app.getHttpServer())
        .put(`/api/profile/quizzes/${quiz._id}/ratings`)
        .send({ stars, comment })
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Missing Authorization header',
            status: 401,
            timestamp: expect.any(String),
          })
        })
    })

    it('should return 401 when bearer token is invalid', async () => {
      return supertest(app.getHttpServer())
        .put(`/api/profile/quizzes/${quiz._id}/ratings`)
        .send({ stars, comment })
        .set({ Authorization: 'Bearer XXX' })
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Invalid or expired token',
            status: 401,
            timestamp: expect.any(String),
          })
        })
    })
  })
})
