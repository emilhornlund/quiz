import { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import {
  GameMode,
  GameParticipantType,
  GameStatus,
  MediaType,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@quiz/common'
import { Model } from 'mongoose'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import { AuthService } from '../src/auth/services'
import { ClientService } from '../src/client/services'
import { Client } from '../src/client/services/models/schemas'
import { Game, GameResult, TaskType } from '../src/game/services/models/schemas'
import { Player } from '../src/player/services/models/schemas'
import { Quiz } from '../src/quiz/services/models/schemas'

import { closeTestApp, createTestApp } from './utils/bootstrap'

describe('GameResultController (e2e)', () => {
  let app: INestApplication
  let authService: AuthService
  let clientService: ClientService
  let gameModel: Model<Game>
  let gameResultModel: Model<GameResult>

  let hostClient: Client
  let playerClient: Client

  beforeEach(async () => {
    app = await createTestApp()
    clientService = app.get(ClientService)
    authService = app.get(AuthService)
    gameModel = app.get<Model<Game>>(getModelToken(Game.name))
    gameResultModel = app.get<Model<GameResult>>(getModelToken(GameResult.name))

    hostClient = await clientService.findOrCreateClient(uuidv4())
    playerClient = await clientService.findOrCreateClient(uuidv4())
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

  describe('/api/games/:gameID/results (GET)', () => {
    it('should succeed in retrieving game results for a classic mode game', async () => {
      const { token } = await authService.authenticate({
        clientId: hostClient._id,
      })

      const game = await gameModel.create(
        buildMockClassicModeGame(hostClient, playerClient),
      )

      const gameResult = await gameResultModel.create(
        buildMockClassicModeGameResult(
          game,
          hostClient.player,
          playerClient.player,
        ),
      )

      return supertest(app.getHttpServer())
        .get(`/api/games/${game._id}/results`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: gameResult.game._id,
            name: 'Classic Quiz Debug',
            mode: GameMode.Classic,
            host: {
              id: hostClient.player._id,
              nickname: hostClient.player.nickname,
            },
            playerMetrics: [
              {
                player: {
                  id: playerClient.player._id,
                  nickname: playerClient.player.nickname,
                },
                rank: 1,
                correct: 4,
                incorrect: 0,
                unanswered: 0,
                averageResponseTime: 2924,
                longestCorrectStreak: 4,
                score: 3846,
              },
            ],
            questionMetrics: [
              {
                text: 'What is the capital of Sweden?',
                type: QuestionType.MultiChoice,
                correct: 1,
                incorrect: 0,
                unanswered: 0,
                averageResponseTime: 1284,
              },
              {
                text: 'Guess the temperature of the hottest day ever recorded.',
                type: QuestionType.Range,
                correct: 1,
                incorrect: 0,
                unanswered: 0,
                averageResponseTime: 3035,
              },
              {
                text: 'The earth is flat.',
                type: QuestionType.TrueFalse,
                correct: 1,
                incorrect: 0,
                unanswered: 0,
                averageResponseTime: 811,
              },
              {
                text: 'What is the capital of Denmark?',
                type: QuestionType.TypeAnswer,
                correct: 1,
                incorrect: 0,
                unanswered: 0,
                averageResponseTime: 6566,
              },
            ],
            duration: 36.035,
            created: gameResult.hosted.toISOString(),
          })
        })
    })

    it('should succeed in retrieving game results for a zero to one hundred mode game', async () => {
      const { token } = await authService.authenticate({
        clientId: hostClient._id,
      })

      const game = await gameModel.create(
        buildMockZeroToOneHundredModeGame(hostClient, playerClient),
      )

      const gameResult = await gameResultModel.create(
        buildMockZeroToOneHundredModeGameResult(
          game,
          hostClient.player,
          playerClient.player,
        ),
      )

      return supertest(app.getHttpServer())
        .get(`/api/games/${game._id}/results`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: gameResult.game._id,
            name: '0-100 Quiz Debug',
            mode: GameMode.ZeroToOneHundred,
            host: {
              id: hostClient.player._id,
              nickname: hostClient.player.nickname,
            },
            playerMetrics: [
              {
                player: {
                  id: playerClient.player._id,
                  nickname: playerClient.player.nickname,
                },
                rank: 1,
                averagePrecision: 0.89,
                unanswered: 0,
                averageResponseTime: 2915,
                longestCorrectStreak: 2,
                score: 26,
              },
            ],
            questionMetrics: [
              {
                text: '2002 levererades den första Koenigseggbilen av modell CC8S. Hur många tillverkades totalt?',
                type: QuestionType.Range,
                averagePrecision: 0.98,
                averageResponseTime: 2890,
                unanswered: 0,
              },
              {
                text: 'Hur många år blev Kubas förre president Fidel Castro?',
                type: QuestionType.Range,
                averagePrecision: 1,
                averageResponseTime: 3274,
                unanswered: 0,
              },
              {
                text: 'Vilka är de två första decimalerna i talet pi?',
                type: QuestionType.Range,
                averagePrecision: 1,
                averageResponseTime: 2426,
                unanswered: 0,
              },
              {
                text: 'Hur många klädda kort finns det i en kortlek?',
                type: QuestionType.Range,
                averagePrecision: 0.56,
                averageResponseTime: 3071,
                unanswered: 0,
              },
            ],
            duration: 57.077,
            created: gameResult.hosted.toISOString(),
          })
        })
    })

    it('should return a 404 error when a game result was not found', async () => {
      const { token } = await authService.authenticate({
        clientId: hostClient._id,
      })

      const game = await gameModel.create(
        buildMockClassicModeGame(hostClient, playerClient),
      )

      return supertest(app.getHttpServer())
        .get(`/api/games/${game._id}/results`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(404)
        .expect((res) => {
          expect(res.body).toEqual({
            message: `Game results not found by game id '${game._id}'`,
            status: 404,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return a 404 error when a game was not found', async () => {
      const { token } = await authService.authenticate({
        clientId: hostClient._id,
      })

      const gameID = uuidv4()

      return supertest(app.getHttpServer())
        .get(`/api/games/${gameID}/results`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(404)
        .expect((res) => {
          expect(res.body).toEqual({
            message: `Game not found by id '${gameID}'`,
            status: 404,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return a 403 forbidden error when player is not a participant of an existing game', async () => {
      const anotherClientId = uuidv4()
      const { token } = await authService.authenticate({
        clientId: anotherClientId,
      })

      const game = await gameModel.create(
        buildMockClassicModeGame(hostClient, playerClient),
      )

      return supertest(app.getHttpServer())
        .get(`/api/games/${game._id}/results`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(403)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Forbidden',
            status: 403,
            timestamp: expect.anything(),
          })
        })
    })

    it('should return a 401 error when the request is unauthorized', () => {
      const gameID = uuidv4()

      return supertest(app.getHttpServer())
        .get(`/api/games/${gameID}/results`)
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Unauthorized',
            status: 401,
            timestamp: expect.anything(),
          })
        })
    })
  })
})

function buildMockClassicModeGame(
  hostClient: Client,
  playerClient: Client,
): Game {
  const date = new Date(Date.now() - 60 * 60 * 24 * 1000) // 1 day ago
  const offset = (seconds: number) => new Date(date.getTime() + seconds * 1000)

  return {
    _id: uuidv4(),
    quiz: { _id: uuidv4() } as Quiz,
    status: GameStatus.Completed,
    name: 'Classic Quiz Debug',
    mode: GameMode.Classic,
    nextQuestion: 4,
    pin: '520612',
    participants: [
      {
        type: GameParticipantType.HOST,
        player: hostClient.player,
        created: offset(0),
        updated: offset(0),
      },
      {
        type: GameParticipantType.PLAYER,
        player: playerClient.player,
        nickname: playerClient.player.nickname,
        created: offset(10.921),
        updated: offset(10.921),
        rank: 1,
        totalScore: 3846,
        currentStreak: 4,
      },
    ],
    currentTask: {
      _id: uuidv4(),
      type: TaskType.Quit,
      status: 'completed',
      created: offset(56.52),
    },
    previousTasks: [
      {
        _id: uuidv4(),
        type: TaskType.Lobby,
        status: 'completed',
        currentTransitionInitiated: offset(14.249),
        currentTransitionExpires: offset(17.249),
        created: offset(0),
      },
      {
        _id: uuidv4(),
        type: TaskType.Question,
        status: 'completed',
        currentTransitionInitiated: offset(21.785),
        created: offset(17.311),
        questionIndex: 0,
        answers: [
          {
            type: QuestionType.MultiChoice,
            playerId: playerClient.player._id,
            created: offset(21.753),
            answer: 0,
          },
        ],
        presented: offset(20.469),
      },
      {
        _id: uuidv4(),
        type: TaskType.QuestionResult,
        status: 'completed',
        currentTransitionInitiated: offset(23.648),
        created: offset(21.797),
        questionIndex: 0,
        correctAnswers: [{ type: QuestionType.MultiChoice, index: 0 }],
        results: [
          {
            type: QuestionType.MultiChoice,
            playerId: playerClient.player._id,
            nickname: playerClient.player.nickname,
            answer: {
              type: QuestionType.MultiChoice,
              playerId: playerClient.player._id,
              created: offset(21.753),
              answer: 0,
            },
            correct: true,
            lastScore: 979,
            totalScore: 979,
            position: 1,
            streak: 1,
          },
        ],
      },
      {
        _id: uuidv4(),
        type: TaskType.Leaderboard,
        status: 'completed',
        currentTransitionInitiated: offset(24.526),
        created: offset(23.659),
        questionIndex: 0,
        leaderboard: [
          {
            playerId: playerClient.player._id,
            position: 1,
            nickname: 'EchoRaptor',
            score: 979,
            streaks: 1,
          },
        ],
      },
      {
        _id: uuidv4(),
        type: TaskType.Question,
        status: 'completed',
        currentTransitionInitiated: offset(33.223),
        created: offset(24.67),
        questionIndex: 1,
        answers: [
          {
            type: QuestionType.Range,
            playerId: playerClient.player._id,
            created: offset(33.19),
            answer: 50,
          },
        ],
        presented: offset(30.155),
      },
      {
        _id: uuidv4(),
        type: TaskType.QuestionResult,
        status: 'completed',
        currentTransitionInitiated: offset(35.531),
        created: offset(33.236),
        questionIndex: 1,
        correctAnswers: [{ type: QuestionType.Range, value: 50 }],
        results: [
          {
            type: QuestionType.Range,
            playerId: playerClient.player._id,
            nickname: playerClient.player.nickname,
            answer: {
              type: QuestionType.Range,
              playerId: playerClient.player._id,
              created: offset(33.19),
              answer: 50,
            },
            correct: true,
            lastScore: 990,
            totalScore: 1969,
            position: 1,
            streak: 2,
          },
        ],
      },
      {
        _id: uuidv4(),
        type: TaskType.Leaderboard,
        status: 'completed',
        currentTransitionInitiated: offset(36.614),
        created: offset(35.542),
        questionIndex: 1,
        leaderboard: [
          {
            playerId: playerClient.player._id,
            position: 1,
            nickname: 'EchoRaptor',
            score: 1969,
            streaks: 2,
          },
        ],
      },
      {
        _id: uuidv4(),
        type: TaskType.Question,
        status: 'completed',
        currentTransitionInitiated: offset(39.433),
        created: offset(36.626),
        questionIndex: 2,
        answers: [
          {
            type: QuestionType.TrueFalse,
            playerId: playerClient.player._id,
            created: offset(39.408),
            answer: false,
          },
        ],
        presented: offset(38.597),
      },
      {
        _id: uuidv4(),
        type: TaskType.QuestionResult,
        status: 'completed',
        currentTransitionInitiated: offset(41.115),
        created: offset(39.451),
        questionIndex: 2,
        correctAnswers: [{ type: QuestionType.TrueFalse, value: false }],
        results: [
          {
            type: QuestionType.TrueFalse,
            playerId: playerClient.player._id,
            nickname: playerClient.player.nickname,
            answer: {
              type: QuestionType.TrueFalse,
              playerId: playerClient.player._id,
              created: offset(39.408),
              answer: false,
            },
            correct: true,
            lastScore: 986,
            totalScore: 2955,
            position: 1,
            streak: 3,
          },
        ],
      },
      {
        _id: uuidv4(),
        type: TaskType.Leaderboard,
        status: 'completed',
        currentTransitionInitiated: offset(42.242),
        created: offset(41.127),
        questionIndex: 2,
        leaderboard: [
          {
            playerId: playerClient.player._id,
            position: 1,
            nickname: 'EchoRaptor',
            score: 2955,
            streaks: 3,
          },
        ],
      },
      {
        _id: uuidv4(),
        type: TaskType.Question,
        status: 'completed',
        currentTransitionInitiated: offset(52.119),
        created: offset(42.254),
        questionIndex: 3,
        answers: [
          {
            type: QuestionType.TypeAnswer,
            playerId: playerClient.player._id,
            created: offset(52.074),
            answer: 'copenhagen',
          },
        ],
        presented: offset(45.508),
      },
      {
        _id: uuidv4(),
        type: TaskType.QuestionResult,
        status: 'completed',
        currentTransitionInitiated: offset(53.334),
        created: offset(52.133),
        questionIndex: 3,
        correctAnswers: [
          { type: QuestionType.TypeAnswer, value: 'Copenhagen' },
          { type: QuestionType.TypeAnswer, value: 'Köpenhamn' },
        ],
        results: [
          {
            type: QuestionType.TypeAnswer,
            playerId: playerClient.player._id,
            nickname: playerClient.player.nickname,
            answer: {
              type: QuestionType.TypeAnswer,
              playerId: playerClient.player._id,
              created: offset(52.074),
              answer: 'copenhagen',
            },
            correct: true,
            lastScore: 891,
            totalScore: 3846,
            position: 1,
            streak: 4,
          },
        ],
      },
      {
        _id: uuidv4(),
        type: TaskType.Podium,
        status: 'completed',
        currentTransitionInitiated: offset(56.514),
        created: offset(53.346),
        leaderboard: [
          {
            playerId: playerClient.player._id,
            position: 1,
            nickname: 'EchoRaptor',
            score: 3846,
            streaks: 4,
          },
        ],
      },
    ],
    questions: [
      {
        type: QuestionType.MultiChoice,
        text: 'What is the capital of Sweden?',
        media: {
          type: MediaType.Image,
          url: 'https://d3hne3c382ip58.cloudfront.net/files/uploads/bookmundi/resized/cmsfeatured/stockholm-old-town-gamla-stan-1680860369-785X440.jpg',
        },
        points: 1000,
        duration: 30,
        options: [
          {
            value: 'Stockholm',
            correct: true,
          },
          {
            value: 'Paris',
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
      },
      {
        type: QuestionType.Range,
        text: 'Guess the temperature of the hottest day ever recorded.',
        media: {
          type: MediaType.Image,
          url: 'https://nineplanets.org/wp-content/uploads/2019/09/Color-Temperature.jpg',
        },
        points: 1000,
        duration: 30,
        min: 0,
        max: 100,
        step: 2,
        margin: QuestionRangeAnswerMargin.Medium,
        correct: 50,
      },
      {
        type: QuestionType.TrueFalse,
        text: 'The earth is flat.',
        media: {
          type: MediaType.Image,
          url: 'https://cdn.sciencesensei.com/wp-content/uploads/2019/07/flat-earth-cover.jpg',
        },
        points: 1000,
        duration: 30,
        correct: false,
      },
      {
        type: QuestionType.TypeAnswer,
        text: 'What is the capital of Denmark?',
        media: {
          type: MediaType.Image,
          url: 'http://fayyaztravels.com/uploads/images/place/Copenhagen.jpg',
        },
        points: 1000,
        duration: 30,
        options: ['Copenhagen', 'Köpenhamn'],
      },
    ],
    updated: offset(56.52),
    created: offset(0),
  }
}

function buildMockZeroToOneHundredModeGame(
  hostClient: Client,
  playerClient: Client,
): Game {
  const date = new Date(Date.now() - 60 * 60 * 24 * 1000) // 1 day ago
  const offset = (seconds: number) => new Date(date.getTime() + seconds * 1000)

  return {
    _id: uuidv4(),
    quiz: { _id: uuidv4() } as Quiz,
    status: GameStatus.Completed,
    mode: GameMode.ZeroToOneHundred,
    name: '0-100 Quiz Debug',
    nextQuestion: 4,
    pin: '520612',
    participants: [
      {
        type: GameParticipantType.HOST,
        player: hostClient.player,
        created: offset(0),
        updated: offset(0),
      },
      {
        type: GameParticipantType.PLAYER,
        player: playerClient.player,
        nickname: playerClient.player.nickname,
        created: offset(10.463),
        updated: offset(10.463),
        rank: 1,
        totalScore: 26,
        currentStreak: 0,
      },
    ],
    currentTask: {
      _id: uuidv4(),
      type: TaskType.Quit,
      status: 'completed',
      created: offset(98.788),
    },
    previousTasks: [
      {
        _id: uuidv4(),
        type: TaskType.Lobby,
        status: 'completed',
        currentTransitionInitiated: offset(12.137),
        currentTransitionExpires: offset(15.137),
        created: offset(0.001),
      },
      {
        _id: uuidv4(),
        type: TaskType.Question,
        status: 'completed',
        currentTransitionInitiated: offset(27.296),
        created: offset(15.212),
        questionIndex: 0,
        answers: [
          {
            type: QuestionType.Range,
            playerId: playerClient._id,
            created: offset(27.267),
            answer: 8,
          },
        ],
        presented: offset(24.377),
      },
      {
        _id: uuidv4(),
        type: TaskType.QuestionResult,
        status: 'completed',
        currentTransitionInitiated: offset(30.141),
        created: offset(27.308),
        questionIndex: 0,
        correctAnswers: [{ type: QuestionType.Range, value: 6 }],
        results: [
          {
            type: QuestionType.Range,
            playerId: playerClient._id,
            nickname: playerClient.player.nickname,
            answer: {
              type: QuestionType.Range,
              playerId: playerClient._id,
              created: offset(27.267),
              answer: 8,
            },
            correct: false,
            lastScore: 2,
            totalScore: 2,
            position: 1,
            streak: 0,
          },
        ],
      },
      {
        _id: uuidv4(),
        type: TaskType.Leaderboard,
        status: 'completed',
        currentTransitionInitiated: offset(31.564),
        created: offset(30.151),
        questionIndex: 0,
        leaderboard: [
          {
            playerId: playerClient._id,
            position: 1,
            nickname: 'ElectricJackal',
            score: 2,
            streaks: 0,
          },
        ],
      },
      {
        _id: uuidv4(),
        type: TaskType.Question,
        status: 'completed',
        currentTransitionInitiated: offset(40.298),
        created: offset(31.574),
        questionIndex: 1,
        answers: [
          {
            type: QuestionType.Range,
            playerId: playerClient._id,
            created: offset(40.256),
            answer: 90,
          },
        ],
        presented: offset(37.982),
      },
      {
        _id: uuidv4(),
        type: TaskType.QuestionResult,
        status: 'completed',
        currentTransitionInitiated: offset(42.38),
        created: offset(40.318),
        questionIndex: 1,
        correctAnswers: [{ type: QuestionType.Range, value: 90 }],
        results: [
          {
            type: QuestionType.Range,
            playerId: playerClient._id,
            nickname: playerClient.player.nickname,
            answer: {
              type: QuestionType.Range,
              playerId: playerClient._id,
              created: offset(40.256),
              answer: 90,
            },
            correct: true,
            lastScore: -10,
            totalScore: -8,
            position: 1,
            streak: 1,
          },
        ],
      },
      {
        _id: uuidv4(),
        type: TaskType.Leaderboard,
        status: 'completed',
        currentTransitionInitiated: offset(44.11),
        created: offset(42.391),
        questionIndex: 1,
        leaderboard: [
          {
            playerId: playerClient._id,
            position: 1,
            nickname: 'ElectricJackal',
            score: -8,
            streaks: 1,
          },
        ],
      },
      {
        _id: uuidv4(),
        type: TaskType.Question,
        status: 'completed',
        currentTransitionInitiated: offset(51.257),
        created: offset(44.124),
        questionIndex: 2,
        answers: [
          {
            type: QuestionType.Range,
            playerId: playerClient._id,
            created: offset(51.223),
            answer: 14,
          },
        ],
        presented: offset(48.797),
      },
      {
        _id: uuidv4(),
        type: TaskType.QuestionResult,
        status: 'completed',
        currentTransitionInitiated: offset(52.797),
        created: offset(51.276),
        questionIndex: 2,
        correctAnswers: [{ type: QuestionType.Range, value: 14 }],
        results: [
          {
            type: QuestionType.Range,
            playerId: playerClient._id,
            nickname: playerClient.player.nickname,
            answer: {
              type: QuestionType.Range,
              playerId: playerClient._id,
              created: offset(51.223),
              answer: 14,
            },
            correct: true,
            lastScore: -10,
            totalScore: -18,
            position: 1,
            streak: 2,
          },
        ],
      },
      {
        _id: uuidv4(),
        type: TaskType.Leaderboard,
        status: 'completed',
        currentTransitionInitiated: offset(55.34),
        created: offset(52.808),
        questionIndex: 2,
        leaderboard: [
          {
            playerId: playerClient._id,
            position: 1,
            nickname: 'ElectricJackal',
            score: -18,
            streaks: 2,
          },
        ],
      },
      {
        _id: uuidv4(),
        type: TaskType.Question,
        status: 'completed',
        currentTransitionInitiated: offset(63.098),
        created: offset(55.353),
        questionIndex: 3,
        answers: [
          {
            type: QuestionType.Range,
            playerId: playerClient._id,
            created: offset(63.043),
            answer: 56,
          },
        ],
        presented: offset(59.972),
      },
      {
        _id: uuidv4(),
        type: TaskType.QuestionResult,
        status: 'completed',
        currentTransitionInitiated: offset(72.279),
        created: offset(63.112),
        questionIndex: 3,
        correctAnswers: [{ type: QuestionType.Range, value: 12 }],
        results: [
          {
            type: QuestionType.Range,
            playerId: playerClient._id,
            nickname: playerClient.player.nickname,
            answer: {
              type: QuestionType.Range,
              playerId: playerClient._id,
              created: offset(63.043),
              answer: 56,
            },
            correct: false,
            lastScore: 44,
            totalScore: 26,
            position: 1,
            streak: 0,
          },
        ],
      },
      {
        _id: uuidv4(),
        type: TaskType.Podium,
        status: 'completed',
        currentTransitionInitiated: offset(98.774),
        created: offset(72.289),
        leaderboard: [
          {
            playerId: playerClient._id,
            position: 1,
            nickname: 'ElectricJackal',
            score: 26,
            streaks: 0,
          },
        ],
      },
    ],
    questions: [
      {
        type: QuestionType.Range,
        text: '2002 levererades den första Koenigseggbilen av modell CC8S. Hur många tillverkades totalt?',
        media: {
          type: MediaType.Image,
          url: 'https://s1.cdn.autoevolution.com/images/gallery/KOENIGSEGG-CC8S-4049_7.jpg',
        },
        points: 0,
        duration: 60,
        min: 0,
        max: 100,
        step: 1,
        margin: QuestionRangeAnswerMargin.None,
        correct: 6,
      },
      {
        type: QuestionType.Range,
        text: 'Hur många år blev Kubas förre president Fidel Castro?',
        media: {
          type: MediaType.Image,
          url: 'http://www.turizmtatilseyahat.com/en/wp-content/uploads/2014/08/fidel-castro-kuba.jpg',
        },
        points: 0,
        duration: 60,
        min: 0,
        max: 100,
        step: 1,
        margin: QuestionRangeAnswerMargin.None,
        correct: 90,
      },
      {
        type: QuestionType.Range,
        text: 'Vilka är de två första decimalerna i talet pi?',
        media: {
          type: MediaType.Image,
          url: 'https://www.nationalgeographic.com.es/medio/2023/02/23/numero-pi_902def82_230223124056_1200x630.jpg',
        },
        points: 0,
        duration: 60,
        min: 0,
        max: 100,
        step: 1,
        margin: QuestionRangeAnswerMargin.None,
        correct: 14,
      },
      {
        type: QuestionType.Range,
        text: 'Hur många klädda kort finns det i en kortlek?',
        media: {
          type: MediaType.Image,
          url: 'https://hallmiba.com/thumb/2826/1024x0/d2b999d1709edbedeb911ad28ec8e6ab.jpg',
        },
        points: 0,
        duration: 60,
        min: 0,
        max: 100,
        step: 1,
        margin: QuestionRangeAnswerMargin.None,
        correct: 12,
      },
    ],
    created: offset(0),
    updated: offset(98.788),
  }
}

function buildMockClassicModeGameResult(
  game: Game,
  hostPlayer: Player,
  player: Player,
): GameResult {
  return {
    _id: uuidv4(),
    game,
    name: game.name,
    host: hostPlayer,
    players: [
      {
        player: player,
        rank: 1,
        correct: 4,
        incorrect: 0,
        unanswered: 0,
        averageResponseTime: 2924,
        longestCorrectStreak: 4,
        score: 3846,
      },
    ],
    questions: [
      {
        text: 'What is the capital of Sweden?',
        type: QuestionType.MultiChoice,
        correct: 1,
        incorrect: 0,
        unanswered: 0,
        averageResponseTime: 1284,
      },
      {
        text: 'Guess the temperature of the hottest day ever recorded.',
        type: QuestionType.Range,
        correct: 1,
        incorrect: 0,
        unanswered: 0,
        averageResponseTime: 3035,
      },
      {
        text: 'The earth is flat.',
        type: QuestionType.TrueFalse,
        correct: 1,
        incorrect: 0,
        unanswered: 0,
        averageResponseTime: 811,
      },
      {
        text: 'What is the capital of Denmark?',
        type: QuestionType.TypeAnswer,
        correct: 1,
        incorrect: 0,
        unanswered: 0,
        averageResponseTime: 6566,
      },
    ],
    hosted: game.previousTasks[1].created,
    completed: game.previousTasks[game.previousTasks.length - 1].created,
  }
}

function buildMockZeroToOneHundredModeGameResult(
  game: Game,
  host: Player,
  player: Player,
): GameResult {
  return {
    _id: uuidv4(),
    game,
    host,
    name: game.name,
    players: [
      {
        player,
        rank: 1,
        averagePrecision: 0.89,
        unanswered: 0,
        averageResponseTime: 2915,
        longestCorrectStreak: 2,
        score: 26,
      },
    ],
    questions: [
      {
        text: '2002 levererades den första Koenigseggbilen av modell CC8S. Hur många tillverkades totalt?',
        type: QuestionType.Range,
        averagePrecision: 0.98,
        averageResponseTime: 2890,
        unanswered: 0,
      },
      {
        text: 'Hur många år blev Kubas förre president Fidel Castro?',
        type: QuestionType.Range,
        averagePrecision: 1,
        averageResponseTime: 3274,
        unanswered: 0,
      },
      {
        text: 'Vilka är de två första decimalerna i talet pi?',
        type: QuestionType.Range,
        averagePrecision: 1,
        averageResponseTime: 2426,
        unanswered: 0,
      },
      {
        text: 'Hur många klädda kort finns det i en kortlek?',
        type: QuestionType.Range,
        averagePrecision: 0.56,
        averageResponseTime: 3071,
        unanswered: 0,
      },
    ],
    hosted: game.previousTasks[1].created,
    completed: game.previousTasks[game.previousTasks.length - 1].created,
  }
}
