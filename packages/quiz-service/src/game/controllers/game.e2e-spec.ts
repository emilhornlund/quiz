import { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import {
  CreateClassicModeGameRequestDto,
  CreateZeroToOneHundredModeGameRequestDto,
  GameMode,
  GameParticipantType,
  QuestionType,
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
import { GameService } from '../services'
import { Game } from '../services/models/schemas'

describe('GameController (e2e)', () => {
  let app: INestApplication
  let gameService: GameService
  let gameModel: Model<Game>
  let authService: AuthService

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
    authService = app.get(AuthService)
  }, 30000)

  afterEach(async () => {
    await app.close()
  }, 30000)

  describe('/api/games (POST)', () => {
    it('should succeed in creating a new classic mode game', () => {
      return supertest(app.getHttpServer())
        .post('/api/games')
        .send(CREATE_CLASSIC_MODE_GAME_REQUEST)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
          expect(res.body).toHaveProperty('token')
        })
    })

    it('should succeed in creating a new zero to one hundred mode game', () => {
      return supertest(app.getHttpServer())
        .post('/api/games')
        .send(CREATE_ZERO_TO_ONE_HUNDRED_MODE_GAME_REQUEST)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
          expect(res.body).toHaveProperty('token')
        })
    })

    it('should fail in creating a new game', () => {
      return supertest(app.getHttpServer())
        .post('/api/games')
        .send({
          mode: GameMode.Classic,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Validation failed')
          expect(res.body).toHaveProperty('status', 400)
          expect(res.body).toHaveProperty('timestamp')
          expect(res.body).toHaveProperty('validationErrors', [
            {
              property: 'name',
              constraints: {
                isString: 'name must be a string',
                minLength: 'name must be longer than or equal to 3 characters',
                maxLength:
                  'name must be shorter than or equal to 25 characters',
              },
            },
            {
              property: 'questions',
              constraints: {
                isArray: 'questions must be an array',
                arrayMinSize: 'questions must contain at least 1 elements',
              },
            },
          ])
        })
    })
  })

  describe('/api/games (GET)', () => {
    it('should succeed in retrieving an existing active classic mode game', async () => {
      const createdGame = await gameService.createGame(
        CREATE_CLASSIC_MODE_GAME_REQUEST,
      )

      const game = await gameModel.findById(createdGame.id).exec()

      return supertest(app.getHttpServer())
        .get(`/api/games?gamePIN=${game.pin}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
        })
    })

    it('should succeed in retrieving an existing active zero to one hundred mode game', async () => {
      const createdGame = await gameService.createGame(
        CREATE_ZERO_TO_ONE_HUNDRED_MODE_GAME_REQUEST,
      )

      const game = await gameModel.findById(createdGame.id).exec()

      return supertest(app.getHttpServer())
        .get(`/api/games?gamePIN=${game.pin}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
        })
    })

    it('should fail to retrieve a classic mode game if it was created more than 6 hours ago', async () => {
      const createdGame = await gameService.createGame(
        CREATE_CLASSIC_MODE_GAME_REQUEST,
      )

      const outdatedDate = new Date(Date.now() - 1000) // 1 second ago
      await gameModel
        .findByIdAndUpdate(createdGame.id, { expires: outdatedDate })
        .exec()

      const game = await gameModel.findById(createdGame.id).exec()

      return supertest(app.getHttpServer())
        .get(`/api/games?gamePIN=${game.pin}`)
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
      const createdGame = await gameService.createGame(
        CREATE_ZERO_TO_ONE_HUNDRED_MODE_GAME_REQUEST,
      )

      const outdatedDate = new Date(Date.now() - 1000) // 1 second ago
      await gameModel
        .findByIdAndUpdate(createdGame.id, { expires: outdatedDate })
        .exec()

      const game = await gameModel.findById(createdGame.id).exec()

      return supertest(app.getHttpServer())
        .get(`/api/games?gamePIN=${game.pin}`)
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
      const createdGame = await gameService.createGame(
        CREATE_CLASSIC_MODE_GAME_REQUEST,
      )

      return supertest(app.getHttpServer())
        .post(`/api/games/${createdGame.id}/players`)
        .send({ nickname: 'FrostyBear' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
          expect(res.body).toHaveProperty('token')
        })
    })

    it('should fail in joining when nickname already taken', async () => {
      const createdGame = await gameService.createGame(
        CREATE_CLASSIC_MODE_GAME_REQUEST,
      )

      await gameModel
        .findByIdAndUpdate(createdGame.id, {
          players: [
            {
              _id: uuidv4(),
              nickname: 'FrostyBear',
              joined: new Date(),
            },
          ],
        })
        .exec()

      return supertest(app.getHttpServer())
        .post(`/api/games/${createdGame.id}/players`)
        .send({ nickname: 'FrostyBear' })
        .expect(409)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            'Nickname "FrostyBear" is already taken in this game.',
          )
          expect(res.body).toHaveProperty('status', 409)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should fail in joining an expired game', async () => {
      const createdGame = await gameService.createGame(
        CREATE_CLASSIC_MODE_GAME_REQUEST,
      )

      const outdatedDate = new Date(Date.now() - 1000) // 1 second ago
      await gameModel
        .findByIdAndUpdate(createdGame.id, { expires: outdatedDate })
        .exec()

      return supertest(app.getHttpServer())
        .post(`/api/games/${createdGame.id}/players`)
        .send({ nickname: 'FrostyBear' })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            `Active game not found by id ${createdGame.id}`,
          )
          expect(res.body).toHaveProperty('status', 404)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should fail in joining with a non existing game ID', async () => {
      const gameID = uuidv4()

      return supertest(app.getHttpServer())
        .post(`/api/games/${gameID}/players`)
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
      const createdGame = await gameService.createGame(
        CREATE_CLASSIC_MODE_GAME_REQUEST,
      )

      const response = supertest(app.getHttpServer())
        .get(`/api/games/${createdGame.id}/events`)
        .set('Authorization', `Bearer ${createdGame.token}`)
        .expect(200)
        .expect('Content-Type', /text\/event-stream/)

      await new Promise<void>((resolve) => {
        response.abort()
        resolve()
      })
    })

    it('should allow event subscription for a player who joined the game', async () => {
      const createdGame = await gameService.createGame(
        CREATE_CLASSIC_MODE_GAME_REQUEST,
      )

      const joinedGame = await gameService.joinGame(
        createdGame.id,
        'FrostyBear',
      )

      const response = supertest(app.getHttpServer())
        .get(`/api/games/${joinedGame.id}/events`)
        .set('Authorization', `Bearer ${joinedGame.token}`)
        .expect(200)
        .expect('Content-Type', /text\/event-stream/)

      await new Promise<void>((resolve) => {
        response.abort()
        resolve()
      })
    })

    it('should deny event subscription without an authorization token', async () => {
      const createdGame = await gameService.createGame(
        CREATE_CLASSIC_MODE_GAME_REQUEST,
      )

      return supertest(app.getHttpServer())
        .get(`/api/games/${createdGame.id}/events`)
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Unauthorized')
          expect(res.body).toHaveProperty('status', 401)
          expect(res.body).toHaveProperty('timestamp')
        })
    })

    it('should return 404 when subscribing to events for a non-existent game ID', async () => {
      const unknownGameID = uuidv4()

      const token = await authService.signGameToken(
        unknownGameID,
        uuidv4(),
        GameParticipantType.HOST,
        Math.floor(new Date().getTime() / 1000) + 6 * 60 * 60,
      )

      return supertest(app.getHttpServer())
        .get(`/api/games/${unknownGameID}/events`)
        .set('Authorization', `Bearer ${token}`)
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

    it('should return 401 when subscribing to events with a token for a different game', async () => {
      const firstCreatedGame = await gameService.createGame(
        CREATE_CLASSIC_MODE_GAME_REQUEST,
      )

      const secondCreatedGame = await gameService.createGame(
        CREATE_CLASSIC_MODE_GAME_REQUEST,
      )

      return supertest(app.getHttpServer())
        .get(`/api/games/${firstCreatedGame.id}/events`)
        .set('Authorization', `Bearer ${secondCreatedGame.token}`)
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Unauthorized game access')
          expect(res.body).toHaveProperty('status', 401)
          expect(res.body).toHaveProperty('timestamp')
        })
    })
  })
})

const CREATE_CLASSIC_MODE_GAME_REQUEST: CreateClassicModeGameRequestDto = {
  name: 'Classic Mode Game',
  mode: GameMode.Classic,
  questions: [
    {
      type: QuestionType.MultiChoice,
      question: 'What is the capital of Sweden?',
      imageURL: 'https://example.com/question-image.png',
      answers: [
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
      points: 1000,
      duration: 30,
    },
    {
      type: QuestionType.TrueFalse,
      question: 'The earth is flat.',
      imageURL: 'https://example.com/question-image.png',
      correct: true,
      points: 1000,
      duration: 30,
    },
    {
      type: QuestionType.Range,
      question: 'Guess the temperature of the hottest day ever recorded.',
      imageURL: 'https://example.com/question-image.png',
      min: 0,
      max: 100,
      correct: 50,
      points: 1000,
      duration: 30,
    },
    {
      type: QuestionType.TypeAnswer,
      question: 'What is the capital of Sweden?',
      imageURL: 'https://example.com/question-image.png',
      correct: 'Stockholm',
      points: 1000,
      duration: 30,
    },
  ],
}

const CREATE_ZERO_TO_ONE_HUNDRED_MODE_GAME_REQUEST: CreateZeroToOneHundredModeGameRequestDto =
  {
    name: '0 to 100 Mode Game',
    mode: GameMode.ZeroToOneHundred,
    questions: [
      {
        type: QuestionType.Range,
        question: 'Guess the temperature of the hottest day ever recorded.',
        imageURL: 'https://example.com/question-image.png',
        correct: 50,
        points: 1000,
        duration: 30,
      },
    ],
  }
