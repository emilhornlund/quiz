import { BadRequestException } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { GameRepository } from '../../game-core/repositories'
import {
  GameDocument,
  TaskType,
} from '../../game-core/repositories/models/schemas'
import { GameEventPublisher } from '../../game-event/services'

import { GameSettingsService } from './game-settings.service'

describe(GameSettingsService.name, () => {
  let service: GameSettingsService
  let gameRepository: jest.Mocked<
    Pick<GameRepository, 'findGameByIDOrThrow' | 'findAndSaveWithLock'>
  >
  let gameEventPublisher: jest.Mocked<Pick<GameEventPublisher, 'publish'>>

  beforeEach(async () => {
    gameRepository = {
      findGameByIDOrThrow: jest.fn(),
      findAndSaveWithLock: jest.fn(),
    }

    gameEventPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        GameSettingsService,
        { provide: GameRepository, useValue: gameRepository },
        { provide: GameEventPublisher, useValue: gameEventPublisher },
      ],
    }).compile()

    service = moduleRef.get(GameSettingsService)

    jest.clearAllMocks()
  })

  describe('saveGameSettings', () => {
    it('should persist settings and return them when game is in active lobby', async () => {
      const gameId = 'game-123'
      const requestedSettings = {
        randomizeQuestionOrder: true,
        randomizeAnswerOrder: false,
      }

      const mockGame = {
        _id: gameId,
        currentTask: {
          type: TaskType.Lobby,
          status: 'active',
        },
      } as GameDocument

      gameRepository.findGameByIDOrThrow.mockResolvedValue(mockGame)

      let savedGame: GameDocument

      gameRepository.findAndSaveWithLock.mockImplementation(
        async (id, callback) => {
          const doc = {
            settings: {
              randomizeQuestionOrder: false,
              randomizeAnswerOrder: false,
            },
          } as GameDocument
          const result = await callback(doc)
          savedGame = {
            ...result,
            settings: {
              randomizeQuestionOrder: result.settings.randomizeQuestionOrder,
              randomizeAnswerOrder: result.settings.randomizeAnswerOrder,
            },
          } as GameDocument
          return savedGame
        },
      )

      const result = await service.saveGameSettings(gameId, requestedSettings)

      expect(gameRepository.findGameByIDOrThrow).toHaveBeenCalledWith(gameId)
      expect(gameRepository.findAndSaveWithLock).toHaveBeenCalledWith(
        gameId,
        expect.any(Function),
      )
      expect(gameEventPublisher.publish).toHaveBeenCalledTimes(1)
      expect(gameEventPublisher.publish).toHaveBeenCalledWith(savedGame!)
      expect(
        gameRepository.findAndSaveWithLock.mock.invocationCallOrder[0],
      ).toBeLessThan(gameEventPublisher.publish.mock.invocationCallOrder[0])
      expect(result).toEqual({
        randomizeQuestionOrder: true,
        randomizeAnswerOrder: false,
      })
    })

    it('should update document fields through mutator callback', async () => {
      const gameId = 'game-123'
      const requestedSettings = {
        randomizeQuestionOrder: true,
        randomizeAnswerOrder: true,
      }

      const mockGame = {
        _id: gameId,
        currentTask: {
          type: TaskType.Lobby,
          status: 'active',
        },
      } as GameDocument

      gameRepository.findGameByIDOrThrow.mockResolvedValue(mockGame)

      let capturedDocument: GameDocument | null = null

      gameRepository.findAndSaveWithLock.mockImplementation(
        async (id, callback) => {
          const doc = {
            settings: {
              randomizeQuestionOrder: false,
              randomizeAnswerOrder: false,
            },
          } as GameDocument
          const result = await callback(doc)
          capturedDocument = result
          return result
        },
      )

      await service.saveGameSettings(gameId, requestedSettings)

      expect(capturedDocument).not.toBeNull()
      expect(capturedDocument!.settings.randomizeQuestionOrder).toBe(true)
      expect(capturedDocument!.settings.randomizeAnswerOrder).toBe(true)
      expect(gameEventPublisher.publish).toHaveBeenCalledTimes(1)
      expect(gameEventPublisher.publish).toHaveBeenCalledWith(capturedDocument)
    })

    it('should return persisted values not request values', async () => {
      const gameId = 'game-123'
      const requestedSettings = {
        randomizeQuestionOrder: true,
        randomizeAnswerOrder: false,
      }

      const mockGame = {
        _id: gameId,
        currentTask: {
          type: TaskType.Lobby,
          status: 'active',
        },
      } as GameDocument

      gameRepository.findGameByIDOrThrow.mockResolvedValue(mockGame)

      const mockSavedGame = {
        settings: {
          randomizeQuestionOrder: false,
          randomizeAnswerOrder: true,
        },
      } as GameDocument

      gameRepository.findAndSaveWithLock.mockResolvedValue(mockSavedGame)

      const result = await service.saveGameSettings(gameId, requestedSettings)

      expect(result).toEqual({
        randomizeQuestionOrder: false,
        randomizeAnswerOrder: true,
      })
      expect(gameEventPublisher.publish).toHaveBeenCalledTimes(1)
      expect(gameEventPublisher.publish).toHaveBeenCalledWith(mockSavedGame)
    })

    it('should throw BadRequestException when task type is not Lobby', async () => {
      const gameId = 'game-123'
      const requestedSettings = {
        randomizeQuestionOrder: true,
        randomizeAnswerOrder: false,
      }

      const mockGame = {
        _id: gameId,
        currentTask: {
          type: TaskType.Question,
          status: 'active',
        },
      } as GameDocument

      gameRepository.findGameByIDOrThrow.mockResolvedValue(mockGame)

      await expect(
        service.saveGameSettings(gameId, requestedSettings),
      ).rejects.toThrow(BadRequestException)

      await expect(
        service.saveGameSettings(gameId, requestedSettings),
      ).rejects.toThrow(
        'Game settings can only be updated while the game is in an active lobby task.',
      )

      expect(gameRepository.findAndSaveWithLock).not.toHaveBeenCalled()
      expect(gameEventPublisher.publish).not.toHaveBeenCalled()
    })

    it('should throw BadRequestException when task status is not active', async () => {
      const gameId = 'game-123'
      const requestedSettings = {
        randomizeQuestionOrder: true,
        randomizeAnswerOrder: false,
      }

      const mockGame = {
        _id: gameId,
        currentTask: {
          type: TaskType.Lobby,
          status: 'pending',
        },
      } as GameDocument

      gameRepository.findGameByIDOrThrow.mockResolvedValue(mockGame)

      await expect(
        service.saveGameSettings(gameId, requestedSettings),
      ).rejects.toThrow(BadRequestException)

      await expect(
        service.saveGameSettings(gameId, requestedSettings),
      ).rejects.toThrow(
        'Game settings can only be updated while the game is in an active lobby task.',
      )

      expect(gameRepository.findAndSaveWithLock).not.toHaveBeenCalled()
      expect(gameEventPublisher.publish).not.toHaveBeenCalled()
    })

    it('should throw BadRequestException when task status is completed', async () => {
      const gameId = 'game-123'
      const requestedSettings = {
        randomizeQuestionOrder: true,
        randomizeAnswerOrder: false,
      }

      const mockGame = {
        _id: gameId,
        currentTask: {
          type: TaskType.Lobby,
          status: 'completed',
        },
      } as GameDocument

      gameRepository.findGameByIDOrThrow.mockResolvedValue(mockGame)

      await expect(
        service.saveGameSettings(gameId, requestedSettings),
      ).rejects.toThrow(BadRequestException)

      expect(gameRepository.findAndSaveWithLock).not.toHaveBeenCalled()
      expect(gameEventPublisher.publish).not.toHaveBeenCalled()
    })

    it('should propagate error when findGameByIDOrThrow fails', async () => {
      const gameId = 'game-404'
      const requestedSettings = {
        randomizeQuestionOrder: true,
        randomizeAnswerOrder: false,
      }

      const error = new Error('Game not found')
      gameRepository.findGameByIDOrThrow.mockRejectedValue(error)

      await expect(
        service.saveGameSettings(gameId, requestedSettings),
      ).rejects.toThrow(error)

      expect(gameRepository.findAndSaveWithLock).not.toHaveBeenCalled()
      expect(gameEventPublisher.publish).not.toHaveBeenCalled()
    })

    it('should propagate error when findAndSaveWithLock fails', async () => {
      const gameId = 'game-123'
      const requestedSettings = {
        randomizeQuestionOrder: true,
        randomizeAnswerOrder: false,
      }

      const mockGame = {
        _id: gameId,
        currentTask: {
          type: TaskType.Lobby,
          status: 'active',
        },
      } as GameDocument

      gameRepository.findGameByIDOrThrow.mockResolvedValue(mockGame)

      const error = new Error('Database error')
      gameRepository.findAndSaveWithLock.mockRejectedValue(error)

      await expect(
        service.saveGameSettings(gameId, requestedSettings),
      ).rejects.toThrow(error)

      expect(gameEventPublisher.publish).not.toHaveBeenCalled()
    })

    it('should propagate error when publish fails', async () => {
      const gameId = 'game-123'
      const requestedSettings = {
        randomizeQuestionOrder: true,
        randomizeAnswerOrder: false,
      }

      const mockGame = {
        _id: gameId,
        currentTask: {
          type: TaskType.Lobby,
          status: 'active',
        },
      } as GameDocument

      gameRepository.findGameByIDOrThrow.mockResolvedValue(mockGame)

      const mockSavedGame = {
        settings: {
          randomizeQuestionOrder: true,
          randomizeAnswerOrder: false,
        },
      } as GameDocument

      gameRepository.findAndSaveWithLock.mockResolvedValue(mockSavedGame)

      const error = new Error('Event publishing failed')
      gameEventPublisher.publish.mockRejectedValue(error)

      await expect(
        service.saveGameSettings(gameId, requestedSettings),
      ).rejects.toThrow(error)

      expect(gameRepository.findAndSaveWithLock).toHaveBeenCalledWith(
        gameId,
        expect.any(Function),
      )
      expect(gameEventPublisher.publish).toHaveBeenCalledWith(mockSavedGame)
    })
  })
})
