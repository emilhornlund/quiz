import { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import {
  CreateClassicModeGameRequestDto,
  CreateZeroToOneHundredModeGameRequestDto,
  GameMode,
  QuestionType,
} from '@quiz/common'
import { Model } from 'mongoose'
import supertest from 'supertest'

import {
  createTestApp,
  initializeMongoMemoryServer,
  stopMongoMemoryServer,
} from '../../app/utils/test'
import { GameService } from '../services'
import { Game } from '../services/models/schemas'

describe('GameController (e2e)', () => {
  let app: INestApplication
  let gameService: GameService
  let gameModel: Model<Game>

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
        })
    })

    it('should succeed in creating a new zero to one hundred mode game', () => {
      return supertest(app.getHttpServer())
        .post('/api/games')
        .send(CREATE_ZERO_TO_ONE_HUNDRED_MODE_GAME_REQUEST)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
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

      const outdatedDate = new Date(Date.now() - 7 * 60 * 60 * 1000) // 7 hours ago
      await gameModel
        .findByIdAndUpdate(createdGame.id, { created: outdatedDate })
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

      const outdatedDate = new Date(Date.now() - 7 * 60 * 60 * 1000) // 7 hours ago
      await gameModel
        .findByIdAndUpdate(createdGame.id, { created: outdatedDate })
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
})

const CREATE_CLASSIC_MODE_GAME_REQUEST: CreateClassicModeGameRequestDto = {
  name: 'Classic Mode Game',
  mode: GameMode.Classic,
  questions: [
    {
      type: QuestionType.Multi,
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
      type: QuestionType.Slider,
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
        type: QuestionType.Slider,
        question: 'Guess the temperature of the hottest day ever recorded.',
        imageURL: 'https://example.com/question-image.png',
        correct: 50,
        points: 1000,
        duration: 30,
      },
    ],
  }
