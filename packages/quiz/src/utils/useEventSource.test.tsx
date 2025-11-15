import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// eslint-disable-next-line import/order
import { ConnectionStatus } from './useEventSource'

vi.mock('@quiz/common', () => ({
  GameEventType: {
    GameHeartbeat: 'GameHeartbeat',
    SomethingElse: 'SomethingElse',
  },
  HEARTBEAT_INTERVAL: 30000,
}))

vi.mock('../config.ts', () => ({
  default: { quizServiceUrl: 'http://quiz-service.local' },
}))

vi.mock('event-source-polyfill', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instances: any[] = []

  class MockEventSourcePolyfill {
    static readonly CLOSED = 2
    static readonly CONNECTING = 0
    static readonly OPEN = 1

    readyState = MockEventSourcePolyfill.CONNECTING

    onopen: ((ev: Event) => void) | null = null
    onmessage: ((ev: MessageEvent) => void) | null = null
    onerror: ((ev: Event) => void) | null = null

    close = vi.fn(() => {
      this.readyState = MockEventSourcePolyfill.CLOSED
    })

    constructor(
      public url: string,
      public init: Record<string, unknown>,
    ) {
      instances.push(this)
    }
  }

  const _getInstances = () => instances
  const _last = () => instances[instances.length - 1]

  return {
    EventSourcePolyfill: MockEventSourcePolyfill,
    _getInstances,
    _last,
  }
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

  it('passes heartbeatTimeout based on HEARTBEAT_INTERVAL', () => {
    renderHook(() => useEventSource('g1', 't1'))

    expect(last().init).toMatchObject({
      heartbeatTimeout: 30000 * 1.5,
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
    const { result } = renderHook(() => useEventSource('g1', 't1'))
    expect(instances().length).toBe(1)

    act(() => last().onerror?.(new Event('error')))
    expect(result.current[1]).toBe(ConnectionStatus.RECONNECTING)

    act(() => vi.advanceTimersByTime(1000))
    expect(instances().length).toBe(2)

    act(() => last().onerror?.(new Event('error')))
    expect(result.current[1]).toBe(ConnectionStatus.RECONNECTING)

    act(() => vi.advanceTimersByTime(2000))
    expect(instances().length).toBe(3)
  })

  it('does not attempt reconnect when readyState is CLOSED', () => {
    const { result } = renderHook(() => useEventSource('g1', 't1'))
    const current = last()

    ;(current as { readyState: number }).readyState = (
      ESP as unknown as { EventSourcePolyfill: { CLOSED: number } }
    ).EventSourcePolyfill.CLOSED

    act(() => current.onerror?.(new Event('error')))
    act(() => vi.runAllTimers())

    expect(instances().length).toBe(1)
    expect(result.current[1]).toBe(ConnectionStatus.INITIALIZED)
    expect(consoleErrorSpy).not.toHaveBeenCalled()
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
    expect(current.onopen).toBeNull()
    expect(current.onmessage).toBeNull()
    expect(current.onerror).toBeNull()
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
    expect(first.onopen).toBeNull()
    expect(first.onmessage).toBeNull()
    expect(first.onerror).toBeNull()

    rerender({ gid: 'g2', tkn: 't2' })
    expect(instances().length).toBe(3)
  })
})
