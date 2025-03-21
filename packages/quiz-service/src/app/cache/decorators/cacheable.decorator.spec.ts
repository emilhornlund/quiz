import type { Cache } from '@nestjs/cache-manager'

import { Cacheable } from './cacheable.decorator'

describe('Cacheable', () => {
  let getSpy: jest.Mock
  let setSpy: jest.Mock

  class TestService {
    public callCount = 0

    constructor(public readonly cacheManager: Cache) {}

    @Cacheable(60)
    async expensiveMethod(input: string): Promise<string> {
      this.callCount++
      return `result:${input}`
    }
  }

  let service: TestService

  beforeEach(() => {
    getSpy = jest.fn()
    setSpy = jest.fn()

    const mockCacheManager: Cache = {
      get: getSpy,
      set: setSpy,
    } as unknown as Cache

    service = new TestService(mockCacheManager)
  })

  it('calls the original method and caches the result when not cached', async () => {
    getSpy.mockResolvedValue(undefined)
    setSpy.mockResolvedValue(undefined)

    const result = await service.expensiveMethod('foo')

    expect(result).toBe('result:foo')
    expect(service.callCount).toBe(1)
    expect(getSpy).toHaveBeenCalledTimes(1)
    expect(setSpy).toHaveBeenCalledTimes(1)

    const [cacheKey, cachedValue, ttl] = setSpy.mock.calls[0]
    expect(cacheKey).toMatch(/^TestService:expensiveMethod:/)
    expect(cachedValue).toBe('result:foo')
    expect(ttl).toBe(60_000)
  })

  it('returns cached result and does not call the original method again', async () => {
    getSpy.mockResolvedValue('cached:foo')

    const result = await service.expensiveMethod('foo')

    expect(result).toBe('cached:foo')
    expect(service.callCount).toBe(0)
    expect(getSpy).toHaveBeenCalledTimes(1)
    expect(setSpy).not.toHaveBeenCalled()
  })

  it('throws if cacheManager is missing', async () => {
    class BrokenService {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      @Cacheable()
      async doSomething(): Promise<string> {
        return 'bad'
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const broken = new BrokenService() as any

    await expect(broken.doSomething()).rejects.toThrow(
      "Missing 'cacheManager' on class. Make sure it is injected with @Inject(CACHE_MANAGER).",
    )
  })
})
