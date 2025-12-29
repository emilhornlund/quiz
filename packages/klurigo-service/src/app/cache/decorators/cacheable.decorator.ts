import { createHash } from 'crypto'

import { Cache } from '@nestjs/cache-manager'

/**
 * A method decorator that caches the result of the method using the provided cache manager.
 *
 * Requires that the class has a `public readonly cacheManager: Cache` field
 * injected via `@Inject(CACHE_MANAGER)`.
 *
 * @param ttlSeconds Optional TTL (time to live) in seconds.
 */
export function Cacheable(ttlSeconds?: number) {
  return function <
    T extends { cacheManager: Cache },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    A extends any[],
    R,
  >(
    target: T,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: A) => Promise<R>>,
  ): void {
    const originalMethod = descriptor.value

    if (!originalMethod) return

    descriptor.value = async function (this: T, ...args: A): Promise<R> {
      if (!this.cacheManager) {
        throw new Error(
          `Missing 'cacheManager' on class. Make sure it is injected with @Inject(CACHE_MANAGER).`,
        )
      }

      const className = this.constructor.name
      const methodName = String(propertyKey)

      const argsHash = createHash('sha1')
        .update(JSON.stringify(args))
        .digest('hex')

      const cacheKey = `${className}:${methodName}:${argsHash}`

      const cached = await this.cacheManager.get<R>(cacheKey)
      if (cached !== undefined && cached !== null) return cached

      const result = await originalMethod.apply(this, args)

      await this.cacheManager.set(
        cacheKey,
        result,
        ttlSeconds ? ttlSeconds * 1000 : undefined,
      )

      return result
    }
  }
}
