import { Logger } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { GameRepository } from '../../game-core/repositories'

import { GameExpirySchedulerService } from './game-expiry-scheduler.service'

// Avoid depending on MurLock implementation details in a unit test.
// We only want to test the business logic inside `clean()`.
jest.mock('murlock', () => ({
  MurLock:
    () =>
    (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) =>
      descriptor,
}))

describe(GameExpirySchedulerService.name, () => {
  let service: GameExpirySchedulerService
  let gameRepository: jest.Mocked<GameRepository>

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GameExpirySchedulerService,
        {
          provide: GameRepository,
          useValue: {
            updateCompletedGames: jest.fn(),
            updateExpiredGames: jest.fn(),
          },
        },
      ],
    }).compile()

    service = moduleRef.get(GameExpirySchedulerService)
    gameRepository = moduleRef.get(GameRepository)
  })

  it('updates completed games and expired games, and logs counts', async () => {
    gameRepository.updateCompletedGames.mockResolvedValueOnce(3 as never)
    gameRepository.updateExpiredGames.mockResolvedValueOnce(7 as never)

    const logSpy = jest
      .spyOn((service as any).logger as Logger, 'log')
      .mockImplementation(() => undefined)

    await service.clean()

    expect(gameRepository.updateCompletedGames).toHaveBeenCalledTimes(1)
    expect(gameRepository.updateExpiredGames).toHaveBeenCalledTimes(1)

    expect(logSpy).toHaveBeenCalledTimes(2)
    expect(logSpy).toHaveBeenNthCalledWith(1, 'Updated 3 completed games.')
    expect(logSpy).toHaveBeenNthCalledWith(2, 'Updated 7 expired games.')
  })

  it('propagates error from updateCompletedGames and does not run expired update', async () => {
    const err = new Error('repo failed (completed)')
    gameRepository.updateCompletedGames.mockRejectedValueOnce(err)
    gameRepository.updateExpiredGames.mockResolvedValueOnce(1 as never)

    const logSpy = jest
      .spyOn((service as any).logger as Logger, 'log')
      .mockImplementation(() => undefined)

    await expect(service.clean()).rejects.toThrow('repo failed (completed)')

    expect(gameRepository.updateCompletedGames).toHaveBeenCalledTimes(1)
    expect(gameRepository.updateExpiredGames).not.toHaveBeenCalled()
    expect(logSpy).not.toHaveBeenCalled()
  })

  it('logs completed update, then propagates error from updateExpiredGames', async () => {
    gameRepository.updateCompletedGames.mockResolvedValueOnce(2 as never)

    const err = new Error('repo failed (expired)')
    gameRepository.updateExpiredGames.mockRejectedValueOnce(err)

    const logSpy = jest
      .spyOn((service as any).logger as Logger, 'log')
      .mockImplementation(() => undefined)

    await expect(service.clean()).rejects.toThrow('repo failed (expired)')

    expect(gameRepository.updateCompletedGames).toHaveBeenCalledTimes(1)
    expect(gameRepository.updateExpiredGames).toHaveBeenCalledTimes(1)

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledWith('Updated 2 completed games.')
  })
})
