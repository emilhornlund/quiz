import { Test } from '@nestjs/testing'

import { TokenRepository } from '../repositories'

import { TokenCleanupSchedulerService } from './token-cleanup-scheduler.service'

jest.mock('murlock', () => ({
  MurLock: () => {
    return (
      _target: unknown,
      _propertyKey: string | symbol,
      descriptor: PropertyDescriptor,
    ) => descriptor
  },
}))

describe(TokenCleanupSchedulerService.name, () => {
  const fixedNow = new Date('2025-01-01T03:00:00.000Z')

  let service: TokenCleanupSchedulerService
  let tokenRepository: { deleteMany: jest.Mock }

  beforeEach(async () => {
    jest.useFakeTimers()
    jest.setSystemTime(fixedNow)

    tokenRepository = {
      deleteMany: jest.fn(),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        TokenCleanupSchedulerService,
        {
          provide: TokenRepository,
          useValue: tokenRepository,
        },
      ],
    }).compile()

    service = moduleRef.get(TokenCleanupSchedulerService)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('deletes expired tokens and logs the result', async () => {
    tokenRepository.deleteMany.mockResolvedValue(7)

    const logger = (service as unknown as { logger: { log: jest.Mock } }).logger
    const logSpy = jest.spyOn(logger, 'log')

    await service.clean()

    expect(logSpy).toHaveBeenNthCalledWith(1, 'Running scheduled token cleanup')
    expect(tokenRepository.deleteMany).toHaveBeenCalledTimes(1)
    expect(tokenRepository.deleteMany).toHaveBeenCalledWith({
      expiresAt: { $lt: fixedNow },
    })
    expect(logSpy).toHaveBeenNthCalledWith(2, 'Deleted 7 expired tokens.')
  })

  it('logs start and rethrows if deleteMany fails', async () => {
    tokenRepository.deleteMany.mockRejectedValue(new Error('db error'))

    const logger = (service as unknown as { logger: { log: jest.Mock } }).logger
    const logSpy = jest.spyOn(logger, 'log')

    await expect(service.clean()).rejects.toThrow('db error')

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledWith('Running scheduled token cleanup')
    expect(tokenRepository.deleteMany).toHaveBeenCalledWith({
      expiresAt: { $lt: fixedNow },
    })
  })
})
