import { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import {
  GameMode,
  GameParticipantType,
  LanguageCode,
  MediaType,
  QuestionRangeAnswerMargin,
  QuestionType,
  QuizRequestDto,
  QuizVisibility,
} from '@quiz/common'
import { Model } from 'mongoose'
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
import { Player } from '../../player/services/models/schemas'
import { QuizService } from '../../quiz/services'
import { GameService } from '../services'
import { Game, TaskType } from '../services/models/schemas'
import { buildLobbyTask } from '../services/utils'

describe('GameController (e2e)', () => {
  let app: INestApplication
  let gameService: GameService
  let gameModel: Model<Game>
  let playerModel: Model<Player>
  let authService: AuthService
  let clientService: ClientService
  let quizService: QuizService

  let hostClient: Client
  let hostClientToken: string
  let playerClient: Client
  let playerClientToken: string

  beforeAll(async () => {
    await initializeMongoMemoryServer()
  }, 30000)

  afterAll(async () => {
    await stopMongoMemoryServer()
  }, 30000)

  beforeEach(async () => {
    app = await createTestApp()
    gameService = app.get(GameService)
    gameModel = app.get<Model<Game>>(getModelToken(Game.name))
    playerModel = app.get<Model<Player>>(getModelToken(Player.name))
    authService = app.get(AuthService)
    clientService = app.get(ClientService)
    quizService = app.get(QuizService)

    const hostClientId = uuidv4()
    hostClient = await clientService.findOrCreateClient(hostClientId)
    const hostAuthResponse = await authService.authenticate({
      clientId: hostClientId,
    })
    hostClientToken = hostAuthResponse.token

    const playerClientId = uuidv4()
    playerClient = await clientService.findOrCreateClient(playerClientId)
    const playerAuthResponse = await authService.authenticate({
      clientId: playerClientId,
    })
    playerClientToken = playerAuthResponse.token
  }, 30000)

  afterEach(async () => {
    await app.close()
  }, 30000)

  describe('/api/games (GET)', () => {
    it('should succeed in retrieving an existing active classic mode game', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      const game = await gameModel.findById(gameID).exec()

      return supertest(app.getHttpServer())
        .get(`/api/games?gamePIN=${game.pin}`)
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
        })
    })

    it('should succeed in retrieving an existing active zero to one hundred mode game', async () => {
      const { id: quizId } = await quizService.createQuiz(
        zeroToOneHundredQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      const game = await gameModel.findById(gameID).exec()

      return supertest(app.getHttpServer())
        .get(`/api/games?gamePIN=${game.pin}`)
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
        })
    })

    it('should fail to retrieve a classic mode game if it was created more than 6 hours ago', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      const outdatedDate = new Date(Date.now() - 1000) // 1 second ago
      await gameModel
        .findByIdAndUpdate(gameID, { expires: outdatedDate })
        .exec()

      const game = await gameModel.findById(gameID).exec()

      return supertest(app.getHttpServer())
        .get(`/api/games?gamePIN=${game.pin}`)
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            `Active game not found by PIN ${game.pin}`,
          )
          expect(res.body).toHaveProperty('status', 404)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should fail to retrieve a zero to one hundred mode game if it was created more than 6 hours ago', async () => {
      const { id: quizId } = await quizService.createQuiz(
        zeroToOneHundredQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      const outdatedDate = new Date(Date.now() - 1000) // 1 second ago
      await gameModel
        .findByIdAndUpdate(gameID, { expires: outdatedDate })
        .exec()

      const game = await gameModel.findById(gameID).exec()

      return supertest(app.getHttpServer())
        .get(`/api/games?gamePIN=${game.pin}`)
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            `Active game not found by PIN ${game.pin}`,
          )
          expect(res.body).toHaveProperty('status', 404)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should fail in retrieving a non existing active game', async () => {
      return supertest(app.getHttpServer())
        .get('/api/games?gamePIN=123456')
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            'Active game not found by PIN 123456',
          )
          expect(res.body).toHaveProperty('status', 404)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should fail in retrieving an active game without a game PIN', async () => {
      return supertest(app.getHttpServer())
        .get('/api/games')
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Validation failed')
          expect(res.body).toHaveProperty('status', 400)
          expect(res.body).toHaveProperty('timestamp')
        })
    })
  })

  describe('/api/games/:gameID/players (POST)', () => {
    it('should succeed in joining an existing active classic mode game', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/players`)
        .set({ Authorization: `Bearer ${playerClientToken}` })
        .send({ nickname: 'FrostyBear' })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should succeed in joining when nickname equals host player name', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      await playerModel
        .findByIdAndUpdate(hostClient.player._id, { nickname: 'FrostyBear' })
        .exec()

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/players`)
        .set({ Authorization: `Bearer ${playerClientToken}` })
        .send({ nickname: 'FrostyBear' })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should fail in joining client has already joined', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameModel
        .findByIdAndUpdate(gameID, {
          participants: [
            {
              type: GameParticipantType.PLAYER,
              client: playerClient,
              totalScore: 0,
              currentStreak: 0,
              created: new Date(),
              updated: new Date(),
            },
          ],
        })
        .exec()

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/players`)
        .set({ Authorization: `Bearer ${playerClientToken}` })
        .send({ nickname: 'FrostyBear' })
        .expect(409)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Client has already joined this game',
            status: 409,
            timestamp: expect.anything(),
          })
        })
    })

    it('should fail in joining when nickname already taken', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      const secondPlayerClient =
        await clientService.findOrCreateClient(uuidv4())

      await playerModel
        .findByIdAndUpdate(secondPlayerClient.player._id, {
          nickname: 'FrostyBear',
        })
        .exec()

      await gameModel
        .findByIdAndUpdate(gameID, {
          participants: [
            {
              type: GameParticipantType.PLAYER,
              client: secondPlayerClient,
              totalScore: 0,
              currentStreak: 0,
              created: new Date(),
              updated: new Date(),
            },
          ],
        })
        .exec()

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/players`)
        .set({ Authorization: `Bearer ${playerClientToken}` })
        .send({ nickname: 'FrostyBear' })
        .expect(409)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            'Nickname "FrostyBear" is already taken in this game',
          )
          expect(res.body).toHaveProperty('status', 409)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should fail in joining an expired game', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      const outdatedDate = new Date(Date.now() - 1000) // 1 second ago
      await gameModel
        .findByIdAndUpdate(gameID, { expires: outdatedDate })
        .exec()

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/players`)
        .set({ Authorization: `Bearer ${playerClientToken}` })
        .send({ nickname: 'FrostyBear' })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            `Active game not found by id ${gameID}`,
          )
          expect(res.body).toHaveProperty('status', 404)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should fail in joining with a non existing game ID', async () => {
      const gameID = uuidv4()

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/players`)
        .set({ Authorization: `Bearer ${playerClientToken}` })
        .send({ nickname: 'FrostyBear' })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            `Active game not found by id ${gameID}`,
          )
          expect(res.body).toHaveProperty('status', 404)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should fail in joining with an invalid game ID', async () => {
      return supertest(app.getHttpServer())
        .post('/api/games/non-uuid/players')
        .set({ Authorization: `Bearer ${playerClientToken}` })
        .send({ nickname: 'FrostyBear' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            'Validation failed (uuid is expected)',
          )
          expect(res.body).toHaveProperty('status', 400)
          expect(res.body).toHaveProperty('timestamp')
        })
    })
  })

  describe('/api/games/:gameID/events (GET)', () => {
    it('should allow event subscription after game creation with a valid token', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      const response = supertest(app.getHttpServer())
        .get(`/api/games/${gameID}/events`)
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(200)
        .expect('Content-Type', /text\/event-stream/)

      await new Promise<void>((resolve) => {
        response.abort()
        resolve()
      })
    })

    it('should allow event subscription for a player who joined the game', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameService.joinGame(gameID, playerClient, 'FrostyBear')

      const response = supertest(app.getHttpServer())
        .get(`/api/games/${gameID}/events`)
        .set({ Authorization: `Bearer ${playerClientToken}` })
        .expect(200)
        .expect('Content-Type', /text\/event-stream/)

      await new Promise<void>((resolve) => {
        response.abort()
        resolve()
      })
    })

    it('should deny event subscription without an authorization token', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      return supertest(app.getHttpServer())
        .get(`/api/games/${gameID}/events`)
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Unauthorized')
          expect(res.body).toHaveProperty('status', 401)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should return 404 when subscribing to events for a non-existent game ID', async () => {
      const unknownGameID = uuidv4()

      return supertest(app.getHttpServer())
        .get(`/api/games/${unknownGameID}/events`)
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            `Active game not found by id ${unknownGameID}`,
          )
          expect(res.body).toHaveProperty('status', 404)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should return Forbidden when subscribing to events with a token for a different game', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      const { id: quizIdSecond } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      await gameService.createGame(quizIdSecond, playerClient)

      return supertest(app.getHttpServer())
        .get(`/api/games/${gameID}/events`)
        .set({ Authorization: `Bearer ${playerClientToken}` })
        .expect(403)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Forbidden')
          expect(res.body).toHaveProperty('status', 403)
          expect(res.body).toHaveProperty('timestamp')
        })
    })
  })

  describe('/api/games/:gameID/tasks/current/complete (POST)', () => {
    it('should succeed in completing the current task', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameModel
        .findByIdAndUpdate(gameID, { 'currentTask.status': 'active' })
        .exec()

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/tasks/current/complete`)
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(204)
        .expect((res) => {
          expect(res.body).toStrictEqual({})
        })
    })

    it('should fail in completing the current task if its current status is pending', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameModel
        .findByIdAndUpdate(gameID, { 'currentTask.status': 'pending' })
        .exec()

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/tasks/current/complete`)
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            'Current task not in active status',
          )
          expect(res.body).toHaveProperty('status', 400)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should fail in completing the current task if its current status is already completed', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameModel
        .findByIdAndUpdate(gameID, { 'currentTask.status': 'completed' })
        .exec()

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/tasks/current/complete`)
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            'Current task not in active status',
          )
          expect(res.body).toHaveProperty('status', 400)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should deny completing the current task without an authorization token', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/tasks/current/complete`)
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Unauthorized')
          expect(res.body).toHaveProperty('status', 401)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should return 404 when completing the current task for a non-existent game ID', async () => {
      const unknownGameID = uuidv4()

      return supertest(app.getHttpServer())
        .post(`/api/games/${unknownGameID}/tasks/current/complete`)
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            `Active game not found by id ${unknownGameID}`,
          )
          expect(res.body).toHaveProperty('status', 404)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should return 401 when completing the current task with a token for a different game', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      const { id: quizIdSecond } = await quizService.createQuiz(
        classicQuizRequest,
        playerClient.player,
      )

      await gameService.createGame(quizIdSecond, playerClient)

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/tasks/current/complete`)
        .set({ Authorization: `Bearer ${playerClientToken}` })
        .expect(403)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Forbidden')
          expect(res.body).toHaveProperty('status', 403)
          expect(res.body).toHaveProperty('timestamp')
        })
    })
  })

  describe('/api/games/:gameID/answers (POST)', () => {
    it('should submit a valid multi-choice answer successfully', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameService.joinGame(gameID, playerClient, 'FrostyBear')

      await gameModel
        .findByIdAndUpdate(gameID, {
          currentTask: {
            _id: uuidv4(),
            type: TaskType.Question,
            status: 'active',
            questionIndex: 0,
            answers: [],
            created: new Date(),
          },
        })
        .exec()

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/answers`)
        .set({ Authorization: `Bearer ${playerClientToken}` })
        .send({ type: QuestionType.MultiChoice, optionIndex: 0 })
        .expect(204)
        .expect((res) => {
          expect(res.body).toStrictEqual({})
        })
    })

    it('should return Forbidden when a host tries to submit an answer', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameModel
        .findByIdAndUpdate(gameID, {
          currentTask: {
            _id: uuidv4(),
            type: TaskType.Question,
            status: 'active',
            questionIndex: 0,
            answers: [],
            created: new Date(),
          },
        })
        .exec()

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/answers`)
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .send({ type: QuestionType.MultiChoice, optionIndex: 0 })
        .expect(403)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Forbidden')
          expect(res.body).toHaveProperty('status', 403)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should return BadRequest for invalid task status', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameService.joinGame(gameID, playerClient, 'FrostyBear')

      await gameModel
        .findByIdAndUpdate(gameID, {
          currentTask: {
            _id: uuidv4(),
            type: TaskType.Question,
            status: 'pending',
            questionIndex: 0,
            answers: [],
            created: new Date(),
          },
        })
        .exec()

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/answers`)
        .set('Authorization', `Bearer ${playerClientToken}`)
        .send({ type: QuestionType.MultiChoice, optionIndex: 0 })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            'Current task is either not of question type or not in active status',
          )
          expect(res.body).toHaveProperty('status', 400)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should return BadRequest for non-question task type', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameService.joinGame(gameID, playerClient, 'FrostyBear')

      await gameModel
        .findByIdAndUpdate(gameID, { currentTask: buildLobbyTask() })
        .exec()

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/answers`)
        .set('Authorization', `Bearer ${playerClientToken}`)
        .send({ type: QuestionType.MultiChoice, optionIndex: 0 })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            'Current task is either not of question type or not in active status',
          )
          expect(res.body).toHaveProperty('status', 400)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should return BadRequest when the player has already submitted an answer', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameService.joinGame(gameID, playerClient, 'FrostyBear')

      await gameModel
        .findByIdAndUpdate(gameID, {
          currentTask: {
            _id: uuidv4(),
            type: TaskType.Question,
            status: 'active',
            questionIndex: 0,
            answers: [],
            created: new Date(),
          },
        })
        .exec()

      await gameService.submitQuestionAnswer(gameID, playerClient.player._id, {
        type: QuestionType.MultiChoice,
        optionIndex: 0,
      })

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/answers`)
        .set('Authorization', `Bearer ${playerClientToken}`)
        .send({ type: QuestionType.MultiChoice, optionIndex: 0 })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Answer already provided')
          expect(res.body).toHaveProperty('status', 400)
          expect(res.body).toHaveProperty('timestamp')
        })
    })
  })
})

const classicQuizRequest: QuizRequestDto = {
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
    {
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
    },
    {
      type: QuestionType.TrueFalse,
      question: 'The earth is flat.',
      media: {
        type: MediaType.Image,
        url: 'https://example.com/question-image.png',
      },
      correct: false,
      points: 1000,
      duration: 30,
    },
    {
      type: QuestionType.TypeAnswer,
      question: 'What is the capital of Denmark?',
      media: {
        type: MediaType.Image,
        url: 'https://example.com/question-image.png',
      },
      options: ['Copenhagen'],
      points: 1000,
      duration: 30,
    },
  ],
}

const zeroToOneHundredQuizRequest: QuizRequestDto = {
  title: 'Updated Trivia Battle',
  description: 'A fun and engaging updated trivia quiz for all ages.',
  mode: GameMode.ZeroToOneHundred,
  visibility: QuizVisibility.Private,
  imageCoverURL: 'https://example.com/updated-question-cover-image.png',
  languageCode: LanguageCode.Swedish,
  questions: [
    {
      type: QuestionType.Range,
      question: 'Guess the temperature of the hottest day ever recorded.',
      media: {
        type: MediaType.Image,
        url: 'https://example.com/question-image.png',
      },
      correct: 50,
      duration: 30,
    },
  ],
}
