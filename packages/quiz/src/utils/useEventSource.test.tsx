import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// eslint-disable-next-line import/order
import { ConnectionStatus } from './useEventSource'

vi.mock('@quiz/common', () => ({
  GameEventType: {
    GameHeartbeat: 'GameHeartbeat',
    SomethingElse: 'SomethingElse',
  },
}))

vi.mock('../config.ts', () => ({
  default: { quizServiceUrl: 'http://quiz-service.local' },
}))

/**
 * IMPORTANT: Self-contained mock for 'event-source-polyfill'
 * Everything it needs lives *inside* this factory so Vitest hoisting is happy.
 * We also export two helper functions so the test can inspect instances.
 */
vi.mock('event-source-polyfill', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instances: any[] = []

  class MockEventSourcePolyfill {
    onopen: ((ev: Event) => void) | null = null
    onmessage: ((ev: MessageEvent) => void) | null = null
    onerror: ((ev: Event) => void) | null = null
    close = vi.fn()

    constructor(
      public url: string,
      public init: Record<string, unknown>,
    ) {
      instances.push(this)
    }
  }

  const _getInstances = () => instances
  const _last = () => instances[instances.length - 1]

  return { EventSourcePolyfill: MockEventSourcePolyfill, _getInstances, _last }
})

import { useEventSource } from './useEventSource'

// eslint-disable-next-line import/order
import * as ESP from 'event-source-polyfill'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ESHelpers = { _getInstances: () => any[]; _last: () => any }
const { _getInstances, _last } = ESP as unknown as ESHelpers

const instances = () => _getInstances()
const last = () => _last()

const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('useEventSource', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    instances().length = 0
    consoleErrorSpy.mockClear()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('does not connect without gameID or token', () => {
    const { result } = renderHook(() => useEventSource(undefined, undefined))
    expect(result.current[1]).toBe(ConnectionStatus.INITIALIZED)
    expect(instances().length).toBe(0)
  })

  it('opens EventSource and moves to CONNECTED on onopen', () => {
    const { result } = renderHook(() => useEventSource('g1', 't1'))
    expect(instances().length).toBe(1)

    act(() => last().onopen?.(new Event('open')))

    expect(result.current[1]).toBe(ConnectionStatus.CONNECTED)
    expect(last().url).toBe('http://quiz-service.local/games/g1/events')
    expect(last().init).toMatchObject({
      headers: {
        Authorization: 'Bearer t1',
        'Content-Type': 'application/json',
      },
    })
  })

  it('ignores heartbeat events', () => {
    const { result } = renderHook(() => useEventSource('g1', 't1'))
    act(() => last().onopen?.(new Event('open')))

    act(() => {
      last().onmessage?.({
        data: JSON.stringify({ type: 'GameHeartbeat' }),
      } as MessageEvent)
    })

    expect(result.current[0]).toBeUndefined()
  })

  it('stores latest non-heartbeat event', () => {
    const { result } = renderHook(() => useEventSource('g1', 't1'))
    act(() => last().onopen?.(new Event('open')))
    act(() => {
      last().onmessage?.({
        data: JSON.stringify({ type: 'SomethingElse', payload: 123 }),
      } as MessageEvent)
    })
    expect(result.current[0]).toMatchObject({
      type: 'SomethingElse',
      payload: 123,
    })
  })

  it('retries with exponential backoff and updates status', () => {
    renderHook(() => useEventSource('g1', 't1'))
    expect(instances().length).toBe(1)

    act(() => last().onerror?.(new Event('error')))
    act(() => vi.advanceTimersByTime(1000))
    expect(instances().length).toBe(2)

    act(() => last().onerror?.(new Event('error')))
    act(() => vi.advanceTimersByTime(2000))
    expect(instances().length).toBe(3)
  })

  it('stops after MAX_RETRIES and sets RECONNECTING_FAILED', () => {
    const { result } = renderHook(() => useEventSource('g1', 't1'))

    for (let i = 0; i < 10; i++) {
      act(() => last().onerror?.(new Event('error')))
      act(() => vi.advanceTimersByTime(30000))
    }

    expect(result.current[1]).toBe(ConnectionStatus.RECONNECTING_FAILED)
    const countAfter = instances().length
    act(() => vi.advanceTimersByTime(30000))
    expect(instances().length).toBe(countAfter)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Max retry attempts reached. Stopping reconnection attempts.',
    )
  })

  it('closes EventSource on unmount', () => {
    const { unmount } = renderHook(() => useEventSource('g1', 't1'))
    const current = last()
    unmount()
    expect(current.close).toHaveBeenCalledTimes(1)
  })

  it('recreates the connection when gameID or token change', () => {
    const { rerender } = renderHook(
      ({ gid, tkn }) => useEventSource(gid, tkn),
      { initialProps: { gid: 'g1', tkn: 't1' } },
    )

    const first = last()

    rerender({ gid: 'g2', tkn: 't1' })
    expect(instances().length).toBe(2)
    expect(first.close).toHaveBeenCalled()

    rerender({ gid: 'g2', tkn: 't2' })
    expect(instances().length).toBe(3)
  })
})
