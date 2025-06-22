import { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { GameMode, GameParticipantType, GameStatus } from '@quiz/common'
import supertest from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import {
  createMockClientDocument,
  createMockGameDocument,
  createMockGameHostParticipantDocument,
  createMockGamePlayerParticipantDocument,
  createMockPlayerDocument,
  createMockQuestionTaskDocument,
  createMockQuitTaskDocument,
  offsetSeconds,
} from '../../../test-utils/data'
import {
  closeTestApp,
  createTestApp,
} from '../../../test-utils/utils/bootstrap'
import { AuthService } from '../../auth/services'
import { Client, ClientModel } from '../../client/services/models/schemas'
import { Player, PlayerModel } from '../../player/services/models/schemas'
import { Game, GameModel } from '../services/models/schemas'

describe('ClientGameController (e2e)', () => {
  let app: INestApplication
  let authService: AuthService
  let playerModel: PlayerModel
  let clientModel: ClientModel
  let gameModel: GameModel

  beforeEach(async () => {
    app = await createTestApp()
    authService = app.get(AuthService)
    playerModel = app.get<PlayerModel>(getModelToken(Player.name))
    clientModel = app.get<ClientModel>(getModelToken(Client.name))
    gameModel = app.get<GameModel>(getModelToken(Game.name))
  })

  afterEach(async () => {
    await closeTestApp(app)
  })

  describe('/api/client/games (GET)', () => {
    it("should succeed in retrieving a player's past active and completed games", async () => {
      const player = await playerModel.create(createMockPlayerDocument())

      const { _id: clientId } = await clientModel.create(
        createMockClientDocument({ player }),
      )

      const { token } = await authService.authenticate({
        clientId,
      })

      await gameModel.insertMany(buildFirstPageGameDocuments(player))

      return supertest(app.getHttpServer())
        .get('/api/client/games')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            results: [
              {
                id: expect.any(String),
                name: 'Trivia Battle',
                mode: GameMode.Classic,
                status: GameStatus.Active,
                participantType: GameParticipantType.PLAYER,
                rank: 5,
                score: 4567,
                created: expect.any(String),
              },
              {
                id: expect.any(String),
                name: 'Trivia Battle',
                mode: GameMode.Classic,
                status: GameStatus.Active,
                participantType: GameParticipantType.HOST,
                created: expect.any(String),
              },
              {
                id: expect.any(String),
                name: 'Trivia Battle',
                mode: GameMode.Classic,
                status: GameStatus.Completed,
                participantType: GameParticipantType.PLAYER,
                rank: 1,
                score: 1337,
                created: expect.any(String),
              },
              {
                id: expect.any(String),
                name: 'Trivia Battle',
                mode: GameMode.Classic,
                status: GameStatus.Completed,
                participantType: GameParticipantType.HOST,
                created: expect.any(String),
              },
              {
                id: expect.any(String),
                name: 'Trivia Battle',
                mode: GameMode.Classic,
                status: GameStatus.Completed,
                participantType: GameParticipantType.HOST,
                created: expect.any(String),
              },
            ],
            offset: 0,
            limit: 5,
            total: 5,
          })
        })
    })

    it("should succeed in retrieving a the second page of the player's past active and completed games", async () => {
      const player = await playerModel.create(createMockPlayerDocument())

      const { _id: clientId } = await clientModel.create(
        createMockClientDocument({ player }),
      )

      const { token } = await authService.authenticate({
        clientId,
      })

      await gameModel.insertMany([
        ...buildFirstPageGameDocuments(player),
        createMockGameDocument({
          status: GameStatus.Completed,
          participants: [
            createMockGamePlayerParticipantDocument({
              player,
              rank: 9,
              totalScore: 499,
            }),
          ],
          currentTask: createMockQuitTaskDocument(),
          created: offsetSeconds(0),
        }),
      ])

      return supertest(app.getHttpServer())
        .get('/api/client/games?offset=5&limit=5')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            results: [
              {
                id: expect.any(String),
                name: 'Trivia Battle',
                mode: GameMode.Classic,
                status: GameStatus.Completed,
                participantType: GameParticipantType.PLAYER,
                rank: 9,
                score: 499,
                created: expect.any(String),
              },
            ],
            offset: 5,
            limit: 5,
            total: 6,
          })
        })
    })

    it('should succeed in retrieving empty results when a player has no past games', async () => {
      const player = await playerModel.create(createMockPlayerDocument())

      const { _id: clientId } = await clientModel.create(
        createMockClientDocument({ player }),
      )

      const { token } = await authService.authenticate({ clientId })

      return supertest(app.getHttpServer())
        .get('/api/client/games')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            results: [],
            offset: 0,
            limit: 5,
            total: 0,
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

function buildFirstPageGameDocuments(player: Player): Game[] {
  return [
    createMockGameDocument({
      status: GameStatus.Expired,
      participants: [createMockGameHostParticipantDocument({ player })],
      created: offsetSeconds(0),
    }),
    createMockGameDocument({
      status: GameStatus.Completed,
      participants: [createMockGameHostParticipantDocument({ player })],
      currentTask: createMockQuitTaskDocument(),
      created: offsetSeconds(1),
    }),
    createMockGameDocument({
      status: GameStatus.Completed,
      participants: [createMockGameHostParticipantDocument({ player })],
      currentTask: createMockQuitTaskDocument(),
      created: offsetSeconds(2),
    }),
    createMockGameDocument({
      status: GameStatus.Completed,
      participants: [
        createMockGamePlayerParticipantDocument({
          player,
          rank: 1,
          totalScore: 1337,
        }),
      ],
      currentTask: createMockQuitTaskDocument(),
      created: offsetSeconds(3),
    }),
    createMockGameDocument({
      status: GameStatus.Active,
      participants: [createMockGameHostParticipantDocument({ player })],
      currentTask: createMockQuestionTaskDocument(),
      created: offsetSeconds(4),
    }),
    createMockGameDocument({
      status: GameStatus.Active,
      participants: [
        createMockGamePlayerParticipantDocument({
          player,
          rank: 5,
          totalScore: 4567,
        }),
      ],
      currentTask: createMockQuestionTaskDocument(),
      created: offsetSeconds(5),
    }),
  ]
}
