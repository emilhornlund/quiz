import { RequestTimeoutException } from '@nestjs/common'
import type { CallHandler, ExecutionContext } from '@nestjs/common'
import type { Reflector } from '@nestjs/core'
import { firstValueFrom, NEVER, Observable, of, throwError } from 'rxjs'

import { NO_TIMEOUT_KEY, TIMEOUT_MS_KEY } from '../decorators'

import { TimeoutInterceptor } from './timeout.interceptor'

const buildExecutionContext = (acceptHeader?: string): ExecutionContext => {
  const request = { headers: { accept: acceptHeader } }

  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext
}

const buildCallHandler = (observable: Observable<unknown>): CallHandler => ({
  handle: () => observable,
})

const buildReflector = (config?: {
  noTimeout?: boolean
  timeoutMs?: number
}): Reflector =>
  ({
    getAllAndOverride: jest.fn((key: string) => {
      if (key === NO_TIMEOUT_KEY) return config?.noTimeout
      if (key === TIMEOUT_MS_KEY) return config?.timeoutMs
      return undefined
    }),
  }) as unknown as Reflector

describe(TimeoutInterceptor.name, () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('returns the handler observable when NoTimeout metadata is set', async () => {
    const interceptor = new TimeoutInterceptor(
      buildReflector({ noTimeout: true }),
    )

    const context = buildExecutionContext('application/json')
    const next = buildCallHandler(of('ok'))

    await expect(
      firstValueFrom(interceptor.intercept(context, next)),
    ).resolves.toBe('ok')
  })

  it('skips timeout enforcement for SSE requests', () => {
    const interceptor = new TimeoutInterceptor(buildReflector({ timeoutMs: 1 }))

    const context = buildExecutionContext('text/event-stream')
    const next = buildCallHandler(NEVER)

    const spy = jest.spyOn(global, 'setTimeout')

    const result$ = interceptor.intercept(context, next)

    expect(result$).toBe(next.handle())
    expect(spy).not.toHaveBeenCalled()
  })

  it('applies the default timeout when no override is provided', async () => {
    const interceptor = new TimeoutInterceptor(buildReflector())

    const context = buildExecutionContext('application/json')
    const next = buildCallHandler(NEVER)

    const promise = firstValueFrom(interceptor.intercept(context, next))

    jest.advanceTimersByTime(5_000)
    await Promise.resolve()

    await expect(promise).rejects.toBeInstanceOf(RequestTimeoutException)
  })

  it('applies the overridden timeout from Timeout metadata', async () => {
    const interceptor = new TimeoutInterceptor(
      buildReflector({ timeoutMs: 50 }),
    )

    const context = buildExecutionContext('application/json')
    const next = buildCallHandler(NEVER)

    const promise = firstValueFrom(interceptor.intercept(context, next))

    jest.advanceTimersByTime(50)
    await Promise.resolve()

    await expect(promise).rejects.toBeInstanceOf(RequestTimeoutException)
  })

  it('passes through non-timeout errors', async () => {
    const interceptor = new TimeoutInterceptor(buildReflector())

    const context = buildExecutionContext('application/json')
    const error = new Error('boom')
    const next = buildCallHandler(throwError(() => error))

    await expect(
      firstValueFrom(interceptor.intercept(context, next)),
    ).rejects.toBe(error)
  })

  it('reads timeout metadata from the reflector', async () => {
    const reflector = buildReflector({ timeoutMs: 1234 })
    const interceptor = new TimeoutInterceptor(reflector)

    const context = buildExecutionContext('application/json')
    const next = buildCallHandler(of('ok'))

    await firstValueFrom(interceptor.intercept(context, next))

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(NO_TIMEOUT_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(TIMEOUT_MS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
  })

  it('returns the handler observable when NoTimeout metadata is set', async () => {
    const reflector = buildReflector({ noTimeout: true })
    const interceptor = new TimeoutInterceptor(reflector)

    const context = buildExecutionContext('application/json')
    const next = buildCallHandler(of('ok'))

    await expect(
      firstValueFrom(interceptor.intercept(context, next)),
    ).resolves.toBe('ok')

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(NO_TIMEOUT_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
  })
})
