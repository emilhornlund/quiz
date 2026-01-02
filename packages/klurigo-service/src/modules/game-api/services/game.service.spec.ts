import { Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test } from '@nestjs/testing'
import { getRedisConnectionToken } from '@nestjs-modules/ioredis'

import { GameRepository } from '../../game-core/repositories'
import { GameEventPublisher } from '../../game-event/services'
import { GameTaskTransitionScheduler } from '../../game-task/services'
import { QuizRepository } from '../../quiz/repositories'

import { GameService } from './game.service'

describe(GameService.name, () => {
  let service: GameService

  let gameRepository: {
    find: jest.Mock
    delete: jest.Mock
  }

  let eventEmitter: {
    emit: jest.Mock
  }

  let debugSpy: jest.SpyInstance

  beforeEach(async () => {
    gameRepository = {
      find: jest.fn(),
      delete: jest.fn(),
    }

    eventEmitter = {
      emit: jest.fn(),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: GameRepository, useValue: gameRepository },
        { provide: QuizRepository, useValue: {} },
        { provide: GameTaskTransitionScheduler, useValue: {} },
        { provide: GameEventPublisher, useValue: {} },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: getRedisConnectionToken(), useValue: {} },
      ],
    }).compile()

    service = moduleRef.get(GameService)

    const logger = (service as unknown as { logger: Logger }).logger
    debugSpy = jest.spyOn(logger, 'debug').mockImplementation(() => undefined)

    jest.clearAllMocks()
  })

  afterEach(() => {
    debugSpy.mockRestore()
  })

  describe('deleteQuiz', () => {
    it('finds games by quiz id and deletes each one', async () => {
      gameRepository.find.mockResolvedValueOnce([
        { _id: 'g-1' },
        { _id: 'g-2' },
      ])
      gameRepository.delete.mockResolvedValue(true)

      await service.deleteQuiz('q-1')

      expect(gameRepository.find).toHaveBeenCalledTimes(1)
      expect(gameRepository.find).toHaveBeenCalledWith({
        quiz: { _id: 'q-1' },
      })

      expect(gameRepository.delete).toHaveBeenCalledTimes(2)
      expect(gameRepository.delete).toHaveBeenNthCalledWith(1, 'g-1')
      expect(gameRepository.delete).toHaveBeenNthCalledWith(2, 'g-2')
    })

    it('emits game.deleted only for successfully deleted games', async () => {
      gameRepository.find.mockResolvedValueOnce([
        { _id: 'g-1' },
        { _id: 'g-2' },
        { _id: 'g-3' },
      ])

      gameRepository.delete
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)

      await service.deleteQuiz('q-1')

      expect(eventEmitter.emit).toHaveBeenCalledTimes(2)
      expect(eventEmitter.emit).toHaveBeenNthCalledWith(1, 'game.deleted', {
        gameId: 'g-1',
      })
      expect(eventEmitter.emit).toHaveBeenNthCalledWith(2, 'game.deleted', {
        gameId: 'g-3',
      })

      expect(debugSpy).toHaveBeenCalledTimes(2)
      expect(debugSpy).toHaveBeenCalledWith(
        `Emitting deleted event for game 'g-1'`,
      )
      expect(debugSpy).toHaveBeenCalledWith(
        `Emitting deleted event for game 'g-3'`,
      )
    })

    it('suppresses repository delete errors and continues processing remaining games', async () => {
      gameRepository.find.mockResolvedValueOnce([
        { _id: 'g-1' },
        { _id: 'g-2' },
        { _id: 'g-3' },
      ])

      gameRepository.delete
        .mockRejectedValueOnce(new Error('db down'))
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      await service.deleteQuiz('q-1')

      expect(gameRepository.delete).toHaveBeenCalledTimes(3)
      expect(gameRepository.delete).toHaveBeenNthCalledWith(1, 'g-1')
      expect(gameRepository.delete).toHaveBeenNthCalledWith(2, 'g-2')
      expect(gameRepository.delete).toHaveBeenNthCalledWith(3, 'g-3')

      expect(eventEmitter.emit).toHaveBeenCalledTimes(2)
      expect(eventEmitter.emit).toHaveBeenNthCalledWith(1, 'game.deleted', {
        gameId: 'g-2',
      })
      expect(eventEmitter.emit).toHaveBeenNthCalledWith(2, 'game.deleted', {
        gameId: 'g-3',
      })
    })

    it('does nothing when no games are found', async () => {
      gameRepository.find.mockResolvedValueOnce([])

      await service.deleteQuiz('q-empty')

      expect(gameRepository.delete).not.toHaveBeenCalled()
      expect(eventEmitter.emit).not.toHaveBeenCalled()
      expect(debugSpy).not.toHaveBeenCalled()
    })
  })
})
