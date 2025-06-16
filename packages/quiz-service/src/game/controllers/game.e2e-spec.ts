import { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import {
  GameMode,
  GameParticipantType,
  GameStatus,
  LanguageCode,
  MediaType,
  QuestionRangeAnswerMargin,
  QuestionType,
  QuizCategory,
  QuizRequestDto,
  QuizVisibility,
} from '@quiz/common'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import {
  createMockGameDocument,
  createMockGameHostParticipantDocument,
  createMockGamePlayerParticipantDocument,
  createMockLeaderboardTaskItem,
  createMockMultiChoiceQuestionDocument,
  createMockPlayerDocument,
  createMockPodiumTaskDocument,
  createMockQuestionResultTaskDocument,
  createMockQuestionTaskDocument,
  createMockRangeQuestionDocument,
  createMockTrueFalseQuestionDocument,
  createMockTypeAnswerQuestionDocument,
  MOCK_DEFAULT_PLAYER_NICKNAME,
  MOCK_TYPE_ANSWER_OPTION_VALUE,
  MOCK_TYPE_ANSWER_OPTION_VALUE_ALTERNATIVE,
  offsetSeconds,
} from '../../../test/data'
import { closeTestApp, createTestApp } from '../../../test/utils/bootstrap'
import { AuthService } from '../../auth/services'
import { ClientService } from '../../client/services'
import { Client } from '../../client/services/models/schemas'
import { Player, PlayerModel } from '../../player/services/models/schemas'
import { QuizService } from '../../quiz/services'
import { GameService } from '../services'
import {
  BaseTask,
  Game,
  GameModel,
  QuestionResultTask,
  QuestionResultTaskItem,
  QuestionTaskBaseAnswer,
  QuestionTaskMultiChoiceAnswer,
  QuestionTaskRangeAnswer,
  QuestionTaskTrueFalseAnswer,
  QuestionTaskTypeAnswerAnswer,
  TaskType,
} from '../services/models/schemas'
import { buildLobbyTask } from '../services/utils'

describe('GameController (e2e)', () => {
  let app: INestApplication
  let gameService: GameService
  let gameModel: GameModel
  let playerModel: PlayerModel
  let authService: AuthService
  let clientService: ClientService
  let quizService: QuizService

  let hostClient: Client
  let hostClientToken: string
  let playerClient: Client
  let playerClientToken: string

  beforeEach(async () => {
    app = await createTestApp()
    gameService = app.get(GameService)
    gameModel = app.get<GameModel>(getModelToken(Game.name))
    playerModel = app.get<PlayerModel>(getModelToken(Player.name))
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
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

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

    it('should fail to retrieve a classic mode game if it has expired', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameModel
        .findByIdAndUpdate(gameID, { status: GameStatus.Expired })
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

    it('should fail to retrieve a zero to one hundred mode game if it expired', async () => {
      const { id: quizId } = await quizService.createQuiz(
        zeroToOneHundredQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameModel
        .findByIdAndUpdate(gameID, { status: GameStatus.Expired })
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
        .send({ nickname: MOCK_DEFAULT_PLAYER_NICKNAME })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should succeed in joining an existing active classic mode game when not on question task', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameModel
        .findByIdAndUpdate(gameID, {
          currentTask: createMockQuestionTaskDocument(),
        })
        .exec()

      await supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/players`)
        .set({ Authorization: `Bearer ${playerClientToken}` })
        .send({ nickname: MOCK_DEFAULT_PLAYER_NICKNAME })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })

      const updatedDocument = await gameModel.findById(gameID)
      expect(updatedDocument.participants).toHaveLength(2)
    })

    it('should succeed in joining when nickname equals host player name', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      await playerModel
        .findByIdAndUpdate(hostClient.player._id, {
          nickname: MOCK_DEFAULT_PLAYER_NICKNAME,
        })
        .exec()

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/players`)
        .set({ Authorization: `Bearer ${playerClientToken}` })
        .send({ nickname: MOCK_DEFAULT_PLAYER_NICKNAME })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should fail in joining when a player has already joined', async () => {
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
              player: playerClient.player,
              nickname: playerClient.player.nickname,
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
        .send({ nickname: MOCK_DEFAULT_PLAYER_NICKNAME })
        .expect(409)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Player has already joined this game',
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
          nickname: MOCK_DEFAULT_PLAYER_NICKNAME,
        })
        .exec()

      await gameModel
        .findByIdAndUpdate(gameID, {
          participants: [
            {
              type: GameParticipantType.PLAYER,
              player: secondPlayerClient.player,
              nickname: MOCK_DEFAULT_PLAYER_NICKNAME,
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
        .send({ nickname: MOCK_DEFAULT_PLAYER_NICKNAME })
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

      await gameModel
        .findByIdAndUpdate(gameID, { status: GameStatus.Expired })
        .exec()

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/players`)
        .set({ Authorization: `Bearer ${playerClientToken}` })
        .send({ nickname: MOCK_DEFAULT_PLAYER_NICKNAME })
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
        .send({ nickname: MOCK_DEFAULT_PLAYER_NICKNAME })
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
        .send({ nickname: MOCK_DEFAULT_PLAYER_NICKNAME })
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

  describe('/api/games/:gameID/players (DELETE)', () => {
    it('should allow a player to leave a game they are part of', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameModel
        .findByIdAndUpdate(gameID, {
          participants: [
            {
              type: GameParticipantType.HOST,
              player: hostClient.player,
              created: new Date(),
              updated: new Date(),
            },
            {
              type: GameParticipantType.PLAYER,
              player: playerClient.player,
              nickname: playerClient.player.nickname,
              totalScore: 0,
              currentStreak: 0,
              created: new Date(),
              updated: new Date(),
            },
          ],
        })
        .exec()

      return supertest(app.getHttpServer())
        .delete(`/api/games/${gameID}/players/${playerClient.player._id}`)
        .set({ Authorization: `Bearer ${playerClientToken}` })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should allow the host to remove a player from the game', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameModel
        .findByIdAndUpdate(gameID, {
          participants: [
            {
              type: GameParticipantType.HOST,
              player: hostClient.player,
              created: new Date(),
              updated: new Date(),
            },
            {
              type: GameParticipantType.PLAYER,
              player: playerClient.player,
              nickname: playerClient.player.nickname,
              totalScore: 0,
              currentStreak: 0,
              created: new Date(),
              updated: new Date(),
            },
          ],
        })
        .exec()

      return supertest(app.getHttpServer())
        .delete(`/api/games/${gameID}/players/${playerClient.player._id}`)
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })
    })

    it('should fail when attempting to remove a player who does not exist', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameModel
        .findByIdAndUpdate(gameID, {
          participants: [
            {
              type: GameParticipantType.HOST,
              player: hostClient.player,
              created: new Date(),
              updated: new Date(),
            },
          ],
        })
        .exec()

      return supertest(app.getHttpServer())
        .delete(`/api/games/${gameID}/players/${playerClient.player._id}`)
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(404)
        .expect((res) => {
          expect(res.body).toEqual({
            message: `Player not found by id ${playerClient.player._id}`,
            status: 404,
            timestamp: expect.anything(),
          })
        })
    })

    it('should prevent a player from removing another player from the game', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      const secondPlayerClient =
        await clientService.findOrCreateClient(uuidv4())

      await playerModel
        .findByIdAndUpdate(secondPlayerClient.player._id, {
          nickname: MOCK_DEFAULT_PLAYER_NICKNAME,
        })
        .exec()

      await gameModel
        .findByIdAndUpdate(gameID, {
          participants: [
            {
              type: GameParticipantType.HOST,
              player: hostClient.player,
              created: new Date(),
              updated: new Date(),
            },
            {
              type: GameParticipantType.PLAYER,
              player: playerClient.player,
              nickname: playerClient.player.nickname,
              totalScore: 0,
              currentStreak: 0,
              created: new Date(),
              updated: new Date(),
            },
            {
              type: GameParticipantType.PLAYER,
              player: secondPlayerClient.player,
              nickname: secondPlayerClient.player.nickname,
              totalScore: 0,
              currentStreak: 0,
              created: new Date(),
              updated: new Date(),
            },
          ],
        })
        .exec()

      return supertest(app.getHttpServer())
        .delete(`/api/games/${gameID}/players/${secondPlayerClient.player._id}`)
        .set({ Authorization: `Bearer ${playerClientToken}` })
        .expect(403)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Forbidden to remove player',
            status: 403,
            timestamp: expect.anything(),
          })
        })
    })

    it('should prevent a host from removing themselves from the game', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameModel
        .findByIdAndUpdate(gameID, {
          participants: [
            {
              type: GameParticipantType.HOST,
              player: hostClient.player,
              created: new Date(),
              updated: new Date(),
            },
          ],
        })
        .exec()

      return supertest(app.getHttpServer())
        .delete(`/api/games/${gameID}/players/${hostClient.player._id}`)
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(403)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Forbidden to remove player',
            status: 403,
            timestamp: expect.anything(),
          })
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

      await gameService.joinGame(
        gameID,
        playerClient,
        MOCK_DEFAULT_PLAYER_NICKNAME,
      )

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
            `Game not found by id '${unknownGameID}'`,
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

    it('should succeed in completing the current podium task with players', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      const player = await playerModel.create(createMockPlayerDocument())

      await gameModel
        .findByIdAndUpdate(gameID, {
          currentTask: createMockPodiumTaskDocument({
            status: 'active',
            leaderboard: [
              createMockLeaderboardTaskItem({ playerId: player._id }),
            ],
          }),
          participants: [
            createMockGameHostParticipantDocument({
              player: hostClient.player,
            }),
            createMockGamePlayerParticipantDocument({ player }),
          ],
        })
        .exec()

      await supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/tasks/current/complete`)
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(204)
        .expect((res) => {
          expect(res.body).toStrictEqual({})
        })

      const {
        status,
        currentTask: { type },
      } = await gameModel.findById(gameID)
      expect(type).toEqual(TaskType.Quit)
      expect(status).toEqual(GameStatus.Completed)
    })

    it('should succeed in completing the current podium task without players', async () => {
      const { id: quizId } = await quizService.createQuiz(
        classicQuizRequest,
        hostClient.player,
      )

      const { id: gameID } = await gameService.createGame(quizId, hostClient)

      await gameModel
        .findByIdAndUpdate(gameID, {
          currentTask: createMockPodiumTaskDocument({ status: 'active' }),
        })
        .exec()

      await supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/tasks/current/complete`)
        .set({ Authorization: `Bearer ${hostClientToken}` })
        .expect(204)
        .expect((res) => {
          expect(res.body).toStrictEqual({})
        })

      const {
        status,
        currentTask: { type },
      } = await gameModel.findById(gameID)
      expect(type).toEqual(TaskType.Quit)
      expect(status).toEqual(GameStatus.Expired)
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
            `Game not found by id '${unknownGameID}'`,
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

      await gameService.joinGame(
        gameID,
        playerClient,
        MOCK_DEFAULT_PLAYER_NICKNAME,
      )

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

      await gameService.joinGame(
        gameID,
        playerClient,
        MOCK_DEFAULT_PLAYER_NICKNAME,
      )

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

      await gameService.joinGame(
        gameID,
        playerClient,
        MOCK_DEFAULT_PLAYER_NICKNAME,
      )

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

      await gameService.joinGame(
        gameID,
        playerClient,
        MOCK_DEFAULT_PLAYER_NICKNAME,
      )

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

  describe('/api/games/:gameID/tasks/current/correct_answers (POST)', () => {
    let secondPlayerClient: Client

    beforeEach(async () => {
      secondPlayerClient = await clientService.findOrCreateClient(uuidv4())
    })

    it('should add a correct multi-choice answer successfully', async () => {
      const gameDocument = await gameModel.create(
        buildMultiChoiceQuestionGameDocument({
          clients: {
            hostClient,
            playerClient,
            secondPlayerClient,
          },
        }),
      )

      await supertest(app.getHttpServer())
        .post(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${hostClientToken}`)
        .send({ type: QuestionType.MultiChoice, index: 1 })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })

      const { correctAnswers, results } = (
        await gameModel.findById(gameDocument._id).exec()
      ).currentTask as BaseTask & QuestionResultTask

      expect(toPlain(correctAnswers)).toEqual([
        { type: QuestionType.MultiChoice, index: 0 },
        { type: QuestionType.MultiChoice, index: 1 },
      ])

      expect(toPlain(results)).toEqual([
        toPlain(
          buildCorrectQuestionResultTaskItem({
            client: playerClient,
            answer: {
              type: QuestionType.MultiChoice,
              answer: 0,
              created: offsetSeconds(3),
            },
            lastScore: 900,
            totalScore: 900,
            position: 1,
          }),
        ),
        toPlain(
          buildCorrectQuestionResultTaskItem({
            client: secondPlayerClient,
            answer: {
              type: QuestionType.MultiChoice,
              answer: 1,
              created: offsetSeconds(4),
            },
            lastScore: 800,
            totalScore: 800,
            position: 2,
          }),
        ),
      ])
    })

    it('should add a correct range answer successfully', async () => {
      const gameDocument = await gameModel.create(
        createMockGameDocument({
          questions: [createMockRangeQuestionDocument()],
          participants: [
            createMockGameHostParticipantDocument({
              player: hostClient.player,
            }),
            createMockGamePlayerParticipantDocument({
              player: playerClient.player,
              nickname: playerClient.player.nickname,
            }),
            createMockGamePlayerParticipantDocument({
              player: secondPlayerClient.player,
              nickname: secondPlayerClient.player.nickname,
            }),
          ],
          currentTask: createMockQuestionResultTaskDocument({
            status: 'active',
            correctAnswers: [{ type: QuestionType.Range, value: 50 }],
            results: [
              buildCorrectQuestionResultTaskItem({
                client: playerClient,
                answer: {
                  type: QuestionType.Range,
                  answer: 50,
                  created: offsetSeconds(3),
                },
                lastScore: 997,
                totalScore: 997,
                position: 1,
              }),
              buildIncorrectQuestionResultTaskItem({
                client: secondPlayerClient,
                answer: {
                  type: QuestionType.Range,
                  answer: 40,
                  created: offsetSeconds(4),
                },
              }),
            ],
            created: offsetSeconds(4),
          }),
          previousTasks: [
            createMockQuestionTaskDocument({
              status: 'active',
              answers: [
                {
                  type: QuestionType.Range,
                  playerId: playerClient.player._id,
                  created: offsetSeconds(3),
                  answer: 50,
                },
                {
                  type: QuestionType.Range,
                  playerId: secondPlayerClient.player._id,
                  created: offsetSeconds(4),
                  answer: 40,
                },
              ],
              presented: offsetSeconds(2),
              created: offsetSeconds(1),
            }),
          ],
        }),
      )

      await supertest(app.getHttpServer())
        .post(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${hostClientToken}`)
        .send({ type: QuestionType.Range, value: 40 })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })

      const { correctAnswers, results } = (
        await gameModel.findById(gameDocument._id).exec()
      ).currentTask as BaseTask & QuestionResultTask

      expect(toPlain(correctAnswers)).toEqual([
        { type: QuestionType.Range, value: 50 },
        { type: QuestionType.Range, value: 40 },
      ])

      expect(toPlain(results)).toEqual([
        toPlain(
          buildCorrectQuestionResultTaskItem({
            client: playerClient,
            answer: {
              type: QuestionType.Range,
              answer: 50,
              created: offsetSeconds(3),
            },
            lastScore: 997,
            totalScore: 997,
            position: 1,
          }),
        ),
        toPlain(
          buildCorrectQuestionResultTaskItem({
            client: secondPlayerClient,
            answer: {
              type: QuestionType.Range,
              answer: 40,
              created: offsetSeconds(4),
            },
            lastScore: 993,
            totalScore: 993,
            position: 2,
          }),
        ),
      ])
    })

    it('should add a correct true-false answer successfully', async () => {
      const gameDocument = await gameModel.create(
        createMockGameDocument({
          questions: [createMockTrueFalseQuestionDocument()],
          participants: [
            createMockGameHostParticipantDocument({
              player: hostClient.player,
            }),
            createMockGamePlayerParticipantDocument({
              player: playerClient.player,
              nickname: playerClient.player.nickname,
            }),
            createMockGamePlayerParticipantDocument({
              player: secondPlayerClient.player,
              nickname: secondPlayerClient.player.nickname,
            }),
          ],
          currentTask: createMockQuestionResultTaskDocument({
            status: 'active',
            correctAnswers: [{ type: QuestionType.TrueFalse, value: false }],
            results: [
              buildCorrectQuestionResultTaskItem({
                client: playerClient,
                answer: {
                  type: QuestionType.TrueFalse,
                  answer: false,
                  created: offsetSeconds(3),
                },
                lastScore: 983,
                totalScore: 983,
                position: 1,
              }),
              buildIncorrectQuestionResultTaskItem({
                client: secondPlayerClient,
                answer: {
                  type: QuestionType.TrueFalse,
                  answer: true,
                  created: offsetSeconds(4),
                },
              }),
            ],
            created: offsetSeconds(4),
          }),
          previousTasks: [
            createMockQuestionTaskDocument({
              status: 'active',
              answers: [
                {
                  type: QuestionType.TrueFalse,
                  playerId: playerClient.player._id,
                  created: offsetSeconds(3),
                  answer: false,
                },
                {
                  type: QuestionType.TrueFalse,
                  playerId: secondPlayerClient.player._id,
                  created: offsetSeconds(4),
                  answer: true,
                },
              ],
              presented: offsetSeconds(2),
              created: offsetSeconds(1),
            }),
          ],
        }),
      )

      await supertest(app.getHttpServer())
        .post(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${hostClientToken}`)
        .send({ type: QuestionType.TrueFalse, value: true })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })

      const { correctAnswers, results } = (
        await gameModel.findById(gameDocument._id).exec()
      ).currentTask as BaseTask & QuestionResultTask

      expect(toPlain(correctAnswers)).toEqual([
        { type: QuestionType.TrueFalse, value: false },
        { type: QuestionType.TrueFalse, value: true },
      ])

      expect(toPlain(results)).toEqual([
        toPlain(
          buildCorrectQuestionResultTaskItem({
            client: playerClient,
            answer: {
              type: QuestionType.TrueFalse,
              answer: false,
              created: offsetSeconds(3),
            },
            lastScore: 983,
            totalScore: 983,
            position: 1,
          }),
        ),
        toPlain(
          buildCorrectQuestionResultTaskItem({
            client: secondPlayerClient,
            answer: {
              type: QuestionType.TrueFalse,
              answer: true,
              created: offsetSeconds(4),
            },
            lastScore: 967,
            totalScore: 967,
            position: 2,
          }),
        ),
      ])
    })

    it('should add a correct type-answer answer successfully', async () => {
      const gameDocument = await gameModel.create(
        createMockGameDocument({
          questions: [createMockTypeAnswerQuestionDocument()],
          participants: [
            createMockGameHostParticipantDocument({
              player: hostClient.player,
            }),
            createMockGamePlayerParticipantDocument({
              player: playerClient.player,
              nickname: playerClient.player.nickname,
            }),
            createMockGamePlayerParticipantDocument({
              player: secondPlayerClient.player,
              nickname: secondPlayerClient.player.nickname,
            }),
          ],
          currentTask: createMockQuestionResultTaskDocument({
            status: 'active',
            correctAnswers: [
              {
                type: QuestionType.TypeAnswer,
                value: MOCK_TYPE_ANSWER_OPTION_VALUE,
              },
            ],
            results: [
              buildCorrectQuestionResultTaskItem({
                client: playerClient,
                answer: {
                  type: QuestionType.TypeAnswer,
                  answer: MOCK_TYPE_ANSWER_OPTION_VALUE,
                  created: offsetSeconds(3),
                },
                lastScore: 983,
                totalScore: 983,
                position: 1,
              }),
              buildIncorrectQuestionResultTaskItem({
                client: secondPlayerClient,
                answer: {
                  type: QuestionType.TypeAnswer,
                  answer: MOCK_TYPE_ANSWER_OPTION_VALUE_ALTERNATIVE,
                  created: offsetSeconds(4),
                },
              }),
            ],
            created: offsetSeconds(4),
          }),
          previousTasks: [
            createMockQuestionTaskDocument({
              status: 'active',
              answers: [
                {
                  type: QuestionType.TypeAnswer,
                  playerId: playerClient.player._id,
                  created: offsetSeconds(3),
                  answer: MOCK_TYPE_ANSWER_OPTION_VALUE,
                },
                {
                  type: QuestionType.TypeAnswer,
                  playerId: secondPlayerClient.player._id,
                  created: offsetSeconds(4),
                  answer: MOCK_TYPE_ANSWER_OPTION_VALUE_ALTERNATIVE,
                },
              ],
              presented: offsetSeconds(2),
              created: offsetSeconds(1),
            }),
          ],
        }),
      )

      await supertest(app.getHttpServer())
        .post(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${hostClientToken}`)
        .send({
          type: QuestionType.TypeAnswer,
          value: MOCK_TYPE_ANSWER_OPTION_VALUE_ALTERNATIVE,
        })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })

      const { correctAnswers, results } = (
        await gameModel.findById(gameDocument._id).exec()
      ).currentTask as BaseTask & QuestionResultTask

      expect(toPlain(correctAnswers)).toEqual([
        {
          type: QuestionType.TypeAnswer,
          value: MOCK_TYPE_ANSWER_OPTION_VALUE,
        },
        {
          type: QuestionType.TypeAnswer,
          value: MOCK_TYPE_ANSWER_OPTION_VALUE_ALTERNATIVE,
        },
      ])

      expect(toPlain(results)).toEqual([
        toPlain(
          buildCorrectQuestionResultTaskItem({
            client: playerClient,
            answer: {
              type: QuestionType.TypeAnswer,
              answer: MOCK_TYPE_ANSWER_OPTION_VALUE,
              created: offsetSeconds(3),
            },
            lastScore: 983,
            totalScore: 983,
            position: 1,
          }),
        ),
        toPlain(
          buildCorrectQuestionResultTaskItem({
            client: secondPlayerClient,
            answer: {
              type: QuestionType.TypeAnswer,
              answer: MOCK_TYPE_ANSWER_OPTION_VALUE_ALTERNATIVE,
              created: offsetSeconds(4),
            },
            lastScore: 967,
            totalScore: 967,
            position: 2,
          }),
        ),
      ])
    })

    it('should return 404 when adding a correct answer to a non-existing game', () => {
      const gameID = uuidv4()

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${hostClientToken}`)
        .send({ type: QuestionType.MultiChoice, index: 0 })
        .expect(404)
        .expect((res) => {
          expect(res.body).toEqual({
            message: `Game not found by id '${gameID}'`,
            status: 404,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return 403 when adding a correct answer as a player', async () => {
      const gameDocument = await gameModel.create(
        buildMultiChoiceQuestionGameDocument({
          clients: {
            hostClient,
            playerClient,
            secondPlayerClient,
          },
        }),
      )

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${playerClientToken}`)
        .send({ type: QuestionType.MultiChoice, index: 1 })
        .expect(403)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Forbidden',
            status: 403,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return 403 when adding a correct answer for a non-authorized game', async () => {
      const gameDocument = await gameModel.create(
        buildMultiChoiceQuestionGameDocument({
          clients: {
            hostClient,
            playerClient,
            secondPlayerClient,
          },
        }),
      )

      const { token } = await authService.authenticate({
        clientId: uuidv4(),
      })

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${token}`)
        .send({ type: QuestionType.MultiChoice, index: 1 })
        .expect(403)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Forbidden',
            status: 403,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return 401 when adding a correct answer when missing authorization', async () => {
      const gameDocument = await gameModel.create(
        buildMultiChoiceQuestionGameDocument({
          clients: {
            hostClient,
            playerClient,
            secondPlayerClient,
          },
        }),
      )

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .send({ type: QuestionType.MultiChoice, index: 1 })
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Unauthorized',
            status: 401,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return 400 when adding a correct answer when invalid result task status', async () => {
      const gameDocument = await gameModel.create(
        buildMultiChoiceQuestionGameDocument({
          game: {
            currentTask: createMockQuestionResultTaskDocument({
              status: 'pending',
              correctAnswers: [{ type: QuestionType.MultiChoice, index: 0 }],
              results: [
                buildCorrectQuestionResultTaskItem({
                  client: playerClient,
                  answer: {
                    type: QuestionType.MultiChoice,
                    answer: 0,
                    created: offsetSeconds(3),
                  },
                  lastScore: 900,
                  totalScore: 900,
                  position: 1,
                }),
                buildIncorrectQuestionResultTaskItem({
                  client: secondPlayerClient,
                  answer: {
                    type: QuestionType.MultiChoice,
                    answer: 1,
                    created: offsetSeconds(4),
                  },
                }),
              ],
              created: offsetSeconds(4),
            }),
          },
          clients: {
            hostClient,
            playerClient,
            secondPlayerClient,
          },
        }),
      )

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${hostClientToken}`)
        .send({ type: QuestionType.MultiChoice, index: 1 })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message:
              'Current task is either not of question result type or not in active status',
            status: 400,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return 400 when adding a correct answer when wrong current task', async () => {
      const gameDocument = await gameModel.create(
        buildMultiChoiceQuestionGameDocument({
          game: {
            currentTask: createMockQuestionTaskDocument(),
          },
          clients: {
            hostClient,
            playerClient,
            secondPlayerClient,
          },
        }),
      )

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${hostClientToken}`)
        .send({ type: QuestionType.MultiChoice, index: 1 })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message:
              'Current task is either not of question result type or not in active status',
            status: 400,
            timestamp: expect.anything(),
          })
        })
    })
  })

  describe('/api/games/:gameID/tasks/current/correct_answers (DELETE)', () => {
    let secondPlayerClient: Client

    beforeEach(async () => {
      secondPlayerClient = await clientService.findOrCreateClient(uuidv4())
    })

    it('should delete a correct multi-choice answer successfully', async () => {
      const gameDocument = await gameModel.create(
        buildMultiChoiceQuestionGameDocument({
          clients: {
            hostClient,
            playerClient,
            secondPlayerClient,
          },
        }),
      )

      await supertest(app.getHttpServer())
        .delete(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${hostClientToken}`)
        .send({ type: QuestionType.MultiChoice, index: 0 })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })

      const { correctAnswers, results } = (
        await gameModel.findById(gameDocument._id).exec()
      ).currentTask as BaseTask & QuestionResultTask

      expect(toPlain(correctAnswers)).toEqual([])

      expect(toPlain(results)).toEqual([
        toPlain(
          buildIncorrectQuestionResultTaskItem({
            client: playerClient,
            answer: {
              type: QuestionType.MultiChoice,
              answer: 0,
              created: offsetSeconds(3),
            },
            position: 1,
          }),
        ),
        toPlain(
          buildIncorrectQuestionResultTaskItem({
            client: secondPlayerClient,
            answer: {
              type: QuestionType.MultiChoice,
              answer: 1,
              created: offsetSeconds(4),
            },
            position: 2,
          }),
        ),
      ])
    })

    it('should delete a correct range answer successfully', async () => {
      const gameDocument = await gameModel.create(
        createMockGameDocument({
          questions: [createMockRangeQuestionDocument()],
          participants: [
            createMockGameHostParticipantDocument({
              player: hostClient.player,
            }),
            createMockGamePlayerParticipantDocument({
              player: playerClient.player,
              nickname: playerClient.player.nickname,
            }),
            createMockGamePlayerParticipantDocument({
              player: secondPlayerClient.player,
              nickname: secondPlayerClient.player.nickname,
            }),
          ],
          currentTask: createMockQuestionResultTaskDocument({
            status: 'active',
            correctAnswers: [{ type: QuestionType.Range, value: 50 }],
            results: [
              buildCorrectQuestionResultTaskItem({
                client: playerClient,
                answer: {
                  type: QuestionType.Range,
                  answer: 50,
                  created: offsetSeconds(3),
                },
                lastScore: 997,
                totalScore: 997,
                position: 1,
              }),
              buildIncorrectQuestionResultTaskItem({
                client: secondPlayerClient,
                answer: {
                  type: QuestionType.Range,
                  answer: 40,
                  created: offsetSeconds(4),
                },
              }),
            ],
            created: offsetSeconds(4),
          }),
          previousTasks: [
            createMockQuestionTaskDocument({
              status: 'active',
              answers: [
                {
                  type: QuestionType.Range,
                  playerId: playerClient.player._id,
                  created: offsetSeconds(3),
                  answer: 50,
                },
                {
                  type: QuestionType.Range,
                  playerId: secondPlayerClient.player._id,
                  created: offsetSeconds(4),
                  answer: 40,
                },
              ],
              presented: offsetSeconds(2),
              created: offsetSeconds(1),
            }),
          ],
        }),
      )

      await supertest(app.getHttpServer())
        .delete(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${hostClientToken}`)
        .send({ type: QuestionType.Range, value: 50 })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })

      const { correctAnswers, results } = (
        await gameModel.findById(gameDocument._id).exec()
      ).currentTask as BaseTask & QuestionResultTask

      expect(toPlain(correctAnswers)).toEqual([])

      expect(toPlain(results)).toEqual([
        toPlain(
          buildIncorrectQuestionResultTaskItem({
            client: playerClient,
            answer: {
              type: QuestionType.Range,
              answer: 50,
              created: offsetSeconds(3),
            },
            position: 1,
          }),
        ),
        toPlain(
          buildIncorrectQuestionResultTaskItem({
            client: secondPlayerClient,
            answer: {
              type: QuestionType.Range,
              answer: 40,
              created: offsetSeconds(4),
            },
            position: 2,
          }),
        ),
      ])
    })

    it('should delete a correct true-false answer successfully', async () => {
      const gameDocument = await gameModel.create(
        createMockGameDocument({
          questions: [createMockTrueFalseQuestionDocument()],
          participants: [
            createMockGameHostParticipantDocument({
              player: hostClient.player,
            }),
            createMockGamePlayerParticipantDocument({
              player: playerClient.player,
              nickname: playerClient.player.nickname,
            }),
            createMockGamePlayerParticipantDocument({
              player: secondPlayerClient.player,
              nickname: secondPlayerClient.player.nickname,
            }),
          ],
          currentTask: createMockQuestionResultTaskDocument({
            status: 'active',
            correctAnswers: [{ type: QuestionType.TrueFalse, value: false }],
            results: [
              buildCorrectQuestionResultTaskItem({
                client: playerClient,
                answer: {
                  type: QuestionType.TrueFalse,
                  answer: false,
                  created: offsetSeconds(3),
                },
                lastScore: 983,
                totalScore: 983,
                position: 1,
              }),
              buildIncorrectQuestionResultTaskItem({
                client: secondPlayerClient,
                answer: {
                  type: QuestionType.TrueFalse,
                  answer: true,
                  created: offsetSeconds(4),
                },
                position: 2,
              }),
            ],
            created: offsetSeconds(4),
          }),
          previousTasks: [
            createMockQuestionTaskDocument({
              status: 'active',
              answers: [
                {
                  type: QuestionType.TrueFalse,
                  playerId: playerClient.player._id,
                  created: offsetSeconds(3),
                  answer: false,
                },
                {
                  type: QuestionType.TrueFalse,
                  playerId: secondPlayerClient.player._id,
                  created: offsetSeconds(4),
                  answer: true,
                },
              ],
              presented: offsetSeconds(2),
              created: offsetSeconds(1),
            }),
          ],
        }),
      )

      await supertest(app.getHttpServer())
        .delete(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${hostClientToken}`)
        .send({ type: QuestionType.TrueFalse, value: false })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })

      const { correctAnswers, results } = (
        await gameModel.findById(gameDocument._id).exec()
      ).currentTask as BaseTask & QuestionResultTask

      expect(toPlain(correctAnswers)).toEqual([])

      expect(toPlain(results)).toEqual([
        toPlain(
          buildIncorrectQuestionResultTaskItem({
            client: playerClient,
            answer: {
              type: QuestionType.TrueFalse,
              answer: false,
              created: offsetSeconds(3),
            },
            position: 1,
          }),
        ),
        toPlain(
          buildIncorrectQuestionResultTaskItem({
            client: secondPlayerClient,
            answer: {
              type: QuestionType.TrueFalse,
              answer: true,
              created: offsetSeconds(4),
            },
            position: 2,
          }),
        ),
      ])
    })

    it('should delete a correct type-answer answer successfully', async () => {
      const gameDocument = await gameModel.create(
        createMockGameDocument({
          questions: [createMockTypeAnswerQuestionDocument()],
          participants: [
            createMockGameHostParticipantDocument({
              player: hostClient.player,
            }),
            createMockGamePlayerParticipantDocument({
              player: playerClient.player,
              nickname: playerClient.player.nickname,
            }),
            createMockGamePlayerParticipantDocument({
              player: secondPlayerClient.player,
              nickname: secondPlayerClient.player.nickname,
            }),
          ],
          currentTask: createMockQuestionResultTaskDocument({
            status: 'active',
            correctAnswers: [
              {
                type: QuestionType.TypeAnswer,
                value: MOCK_TYPE_ANSWER_OPTION_VALUE,
              },
            ],
            results: [
              buildCorrectQuestionResultTaskItem({
                client: playerClient,
                answer: {
                  type: QuestionType.TypeAnswer,
                  answer: MOCK_TYPE_ANSWER_OPTION_VALUE,
                  created: offsetSeconds(3),
                },
                lastScore: 983,
                totalScore: 983,
                position: 1,
              }),
              buildIncorrectQuestionResultTaskItem({
                client: playerClient,
                answer: {
                  type: QuestionType.TypeAnswer,
                  answer: MOCK_TYPE_ANSWER_OPTION_VALUE_ALTERNATIVE,
                  created: offsetSeconds(4),
                },
              }),
            ],
            created: offsetSeconds(4),
          }),
          previousTasks: [
            createMockQuestionTaskDocument({
              status: 'active',
              answers: [
                {
                  type: QuestionType.TypeAnswer,
                  playerId: playerClient.player._id,
                  created: offsetSeconds(3),
                  answer: MOCK_TYPE_ANSWER_OPTION_VALUE,
                },
                {
                  type: QuestionType.TypeAnswer,
                  playerId: secondPlayerClient.player._id,
                  created: offsetSeconds(4),
                  answer: MOCK_TYPE_ANSWER_OPTION_VALUE_ALTERNATIVE,
                },
              ],
              presented: offsetSeconds(2),
              created: offsetSeconds(1),
            }),
          ],
        }),
      )

      await supertest(app.getHttpServer())
        .delete(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${hostClientToken}`)
        .send({
          type: QuestionType.TypeAnswer,
          value: MOCK_TYPE_ANSWER_OPTION_VALUE,
        })
        .expect(204)
        .expect((res) => {
          expect(res.body).toEqual({})
        })

      const { correctAnswers, results } = (
        await gameModel.findById(gameDocument._id).exec()
      ).currentTask as BaseTask & QuestionResultTask

      expect(toPlain(correctAnswers)).toEqual([])

      expect(toPlain(results)).toEqual([
        toPlain(
          buildIncorrectQuestionResultTaskItem({
            client: playerClient,
            answer: {
              type: QuestionType.TypeAnswer,
              answer: MOCK_TYPE_ANSWER_OPTION_VALUE,
              created: offsetSeconds(3),
            },
            position: 1,
          }),
        ),
        toPlain(
          buildIncorrectQuestionResultTaskItem({
            client: secondPlayerClient,
            answer: {
              type: QuestionType.TypeAnswer,
              answer: MOCK_TYPE_ANSWER_OPTION_VALUE_ALTERNATIVE,
              created: offsetSeconds(4),
            },
            position: 2,
          }),
        ),
      ])
    })

    it('should return 404 when deleting a correct answer to a non-existing game', () => {
      const gameID = uuidv4()

      return supertest(app.getHttpServer())
        .delete(`/api/games/${gameID}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${hostClientToken}`)
        .send({ type: QuestionType.MultiChoice, index: 0 })
        .expect(404)
        .expect((res) => {
          expect(res.body).toEqual({
            message: `Game not found by id '${gameID}'`,
            status: 404,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return 403 when deleting a correct answer as a player', async () => {
      const gameDocument = await gameModel.create(
        buildMultiChoiceQuestionGameDocument({
          clients: {
            hostClient,
            playerClient,
            secondPlayerClient,
          },
        }),
      )

      return supertest(app.getHttpServer())
        .delete(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${playerClientToken}`)
        .send({ type: QuestionType.MultiChoice, index: 1 })
        .expect(403)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Forbidden',
            status: 403,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return 403 when deleting a correct answer for a non-authorized game', async () => {
      const gameDocument = await gameModel.create(
        buildMultiChoiceQuestionGameDocument({
          clients: {
            hostClient,
            playerClient,
            secondPlayerClient,
          },
        }),
      )

      const { token } = await authService.authenticate({
        clientId: uuidv4(),
      })

      return supertest(app.getHttpServer())
        .delete(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${token}`)
        .send({ type: QuestionType.MultiChoice, index: 1 })
        .expect(403)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Forbidden',
            status: 403,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return 401 when deleting a correct answer when missing authorization', async () => {
      const gameDocument = await gameModel.create(
        buildMultiChoiceQuestionGameDocument({
          clients: {
            hostClient,
            playerClient,
            secondPlayerClient,
          },
        }),
      )

      return supertest(app.getHttpServer())
        .delete(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .send({ type: QuestionType.MultiChoice, index: 1 })
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Unauthorized',
            status: 401,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return 400 when deleting a correct answer when invalid result task status', async () => {
      const gameDocument = await gameModel.create(
        buildMultiChoiceQuestionGameDocument({
          game: {
            currentTask: createMockQuestionResultTaskDocument({
              status: 'pending',
              correctAnswers: [{ type: QuestionType.MultiChoice, index: 0 }],
              results: [
                buildCorrectQuestionResultTaskItem({
                  client: playerClient,
                  answer: {
                    type: QuestionType.MultiChoice,
                    answer: 0,
                    created: offsetSeconds(3),
                  },
                  lastScore: 900,
                  totalScore: 900,
                  position: 1,
                }),
                buildIncorrectQuestionResultTaskItem({
                  client: secondPlayerClient,
                  answer: {
                    type: QuestionType.MultiChoice,
                    answer: 1,
                    created: offsetSeconds(4),
                  },
                }),
              ],
              created: offsetSeconds(4),
            }),
          },
          clients: {
            hostClient,
            playerClient,
            secondPlayerClient,
          },
        }),
      )

      return supertest(app.getHttpServer())
        .delete(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${hostClientToken}`)
        .send({ type: QuestionType.MultiChoice, index: 1 })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message:
              'Current task is either not of question result type or not in active status',
            status: 400,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return 400 when deleting a correct answer when wrong current task', async () => {
      const gameDocument = await gameModel.create(
        buildMultiChoiceQuestionGameDocument({
          game: {
            currentTask: createMockQuestionTaskDocument(),
          },
          clients: {
            hostClient,
            playerClient,
            secondPlayerClient,
          },
        }),
      )

      return supertest(app.getHttpServer())
        .delete(`/api/games/${gameDocument._id}/tasks/current/correct_answers`)
        .set('Authorization', `Bearer ${hostClientToken}`)
        .send({ type: QuestionType.MultiChoice, index: 1 })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            message:
              'Current task is either not of question result type or not in active status',
            status: 400,
            timestamp: expect.anything(),
          })
        })
    })
  })
})

const classicQuizRequest: QuizRequestDto = {
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
  category: QuizCategory.GeneralKnowledge,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPlain(instance: any): any {
  return JSON.parse(JSON.stringify(instance))
}

function buildMultiChoiceQuestionGameDocument(options: {
  game?: Partial<Game>
  clients: {
    hostClient: Client
    playerClient: Client
    secondPlayerClient: Client
  }
}): Game {
  return createMockGameDocument({
    questions: [createMockMultiChoiceQuestionDocument()],
    participants: [
      createMockGameHostParticipantDocument({
        player: options.clients.hostClient.player,
      }),
      createMockGamePlayerParticipantDocument({
        player: options.clients.playerClient.player,
        nickname: options.clients.playerClient.player.nickname,
      }),
      createMockGamePlayerParticipantDocument({
        player: options.clients.secondPlayerClient.player,
        nickname: options.clients.secondPlayerClient.player.nickname,
      }),
    ],
    currentTask: createMockQuestionResultTaskDocument({
      status: 'active',
      correctAnswers: [{ type: QuestionType.MultiChoice, index: 0 }],
      results: [
        buildCorrectQuestionResultTaskItem({
          client: options.clients.playerClient,
          answer: {
            type: QuestionType.MultiChoice,
            answer: 0,
            created: offsetSeconds(3),
          },
          lastScore: 900,
          totalScore: 900,
          position: 1,
        }),
        buildIncorrectQuestionResultTaskItem({
          client: options.clients.secondPlayerClient,
          answer: {
            type: QuestionType.MultiChoice,
            answer: 1,
            created: offsetSeconds(4),
          },
        }),
      ],
      created: offsetSeconds(4),
    }),
    previousTasks: [
      createMockQuestionTaskDocument({
        status: 'active',
        answers: [
          {
            type: QuestionType.MultiChoice,
            playerId: options.clients.playerClient.player._id,
            created: offsetSeconds(3),
            answer: 0,
          },
          {
            type: QuestionType.MultiChoice,
            playerId: options.clients.secondPlayerClient.player._id,
            created: offsetSeconds(4),
            answer: 1,
          },
        ],
        presented: offsetSeconds(2),
        created: offsetSeconds(1),
      }),
    ],
    ...(options.game ?? {}),
  })
}

function buildCorrectQuestionResultTaskItem(
  options: {
    client: Client
    answer:
      | Omit<QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer, 'playerId'>
      | Omit<QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, 'playerId'>
      | Omit<QuestionTaskBaseAnswer & QuestionTaskTrueFalseAnswer, 'playerId'>
      | Omit<QuestionTaskBaseAnswer & QuestionTaskTypeAnswerAnswer, 'playerId'>
  } & Pick<QuestionResultTaskItem, 'lastScore' | 'totalScore' | 'position'>,
): QuestionResultTaskItem {
  return {
    type: options.answer.type,
    playerId: options.client.player._id,
    answer: {
      type: options.answer.type,
      playerId: options.client.player._id,
      answer: options.answer.answer,
      created: options.answer.created,
    },
    correct: true,
    lastScore: options.lastScore,
    totalScore: options.totalScore,
    position: options.position,
    streak: 1,
  }
}

function buildIncorrectQuestionResultTaskItem(
  options: {
    client: Client
    answer:
      | Omit<QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer, 'playerId'>
      | Omit<QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, 'playerId'>
      | Omit<QuestionTaskBaseAnswer & QuestionTaskTrueFalseAnswer, 'playerId'>
      | Omit<QuestionTaskBaseAnswer & QuestionTaskTypeAnswerAnswer, 'playerId'>
  } & Partial<Pick<QuestionResultTaskItem, 'position'>>,
): QuestionResultTaskItem {
  return {
    type: options.answer.type,
    playerId: options.client.player._id,
    answer: {
      type: options.answer.type,
      playerId: options.client.player._id,
      answer: options.answer.answer,
      created: options.answer.created,
    },
    correct: false,
    lastScore: 0,
    totalScore: 0,
    position: options.position ?? 2,
    streak: 0,
  }
}
