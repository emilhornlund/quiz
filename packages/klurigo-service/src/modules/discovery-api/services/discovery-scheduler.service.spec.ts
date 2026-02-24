import { Logger } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { DiscoveryComputeService } from './discovery-compute.service'
import { DiscoverySchedulerService } from './discovery-scheduler.service'

// Avoid depending on MurLock implementation details in a unit test.
// We only want to test the business logic inside `refreshSnapshot()`.
jest.mock('murlock', () => ({
  MurLock:
    () =>
    (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) =>
      descriptor,
}))

describe(DiscoverySchedulerService.name, () => {
  let service: DiscoverySchedulerService
  let computeService: jest.Mocked<DiscoveryComputeService>

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DiscoverySchedulerService,
        {
          provide: DiscoveryComputeService,
          useValue: {
            compute: jest.fn(),
          },
        },
      ],
    }).compile()

    service = moduleRef.get(DiscoverySchedulerService)
    computeService = moduleRef.get(DiscoveryComputeService)
  })

  it('calls compute() on cron tick and logs start/completion', async () => {
    computeService.compute.mockResolvedValueOnce(undefined)

    const logSpy = jest
      .spyOn((service as any).logger as Logger, 'log')
      .mockImplementation(() => undefined)

    await service.refreshSnapshot()

    expect(computeService.compute).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledTimes(2)
    expect(logSpy).toHaveBeenNthCalledWith(
      1,
      'Starting discovery snapshot computation.',
    )
    expect(logSpy).toHaveBeenNthCalledWith(
      2,
      'Discovery snapshot computation completed.',
    )
  })

  it('propagates errors from compute()', async () => {
    const err = new Error('compute failed')
    computeService.compute.mockRejectedValueOnce(err)

    jest
      .spyOn((service as any).logger as Logger, 'log')
      .mockImplementation(() => undefined)

    await expect(service.refreshSnapshot()).rejects.toThrow('compute failed')

    expect(computeService.compute).toHaveBeenCalledTimes(1)
  })
})
