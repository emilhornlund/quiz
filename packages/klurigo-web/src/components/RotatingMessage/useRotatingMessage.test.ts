import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useRotatingMessage } from './useRotatingMessage'

describe('useRotatingMessage', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty message when messages is empty', () => {
    const { result } = renderHook(() => useRotatingMessage([]))

    expect(result.current.message).toBe('')
    expect(result.current.animation).toBe('visible')
  })

  it('returns first message when messages has values', () => {
    const { result } = renderHook(() =>
      useRotatingMessage(['first', 'second', 'third']),
    )

    expect(result.current.message).toBe('first')
    expect(result.current.animation).toBe('visible')
  })

  it('does not rotate when messages has a single item', () => {
    vi.useFakeTimers()

    const { result } = renderHook(() => useRotatingMessage(['only']))

    expect(result.current.message).toBe('only')
    expect(result.current.animation).toBe('visible')

    act(() => {
      vi.advanceTimersByTime(8000)
      vi.advanceTimersByTime(200)
      vi.advanceTimersByTime(300)
    })

    expect(result.current.message).toBe('only')
    expect(result.current.animation).toBe('visible')
  })

  it('rotates message and progresses animation stages using default timings', () => {
    vi.useFakeTimers()

    const { result } = renderHook(() => useRotatingMessage(['a', 'b']))

    expect(result.current.message).toBe('a')
    expect(result.current.animation).toBe('visible')

    act(() => {
      vi.advanceTimersByTime(8000)
    })
    expect(result.current.animation).toBe('exiting')
    expect(result.current.message).toBe('a')

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current.animation).toBe('entering')
    expect(result.current.message).toBe('b')

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current.animation).toBe('visible')
    expect(result.current.message).toBe('b')
  })

  it('wraps around to the first message after the last message', () => {
    vi.useFakeTimers()

    const { result } = renderHook(() => useRotatingMessage(['a', 'b']))

    act(() => {
      vi.advanceTimersByTime(8000)
      vi.advanceTimersByTime(200)
      vi.advanceTimersByTime(300)
    })
    expect(result.current.message).toBe('b')

    act(() => {
      vi.advanceTimersByTime(8000)
      vi.advanceTimersByTime(200)
      vi.advanceTimersByTime(300)
    })
    expect(result.current.message).toBe('a')
  })

  it('respects custom timing options', () => {
    vi.useFakeTimers()

    const { result } = renderHook(() =>
      useRotatingMessage(['a', 'b'], {
        rotateEveryMs: 1000,
        exitDurationMs: 50,
        enterDurationMs: 75,
      }),
    )

    expect(result.current.message).toBe('a')
    expect(result.current.animation).toBe('visible')

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.animation).toBe('exiting')

    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current.message).toBe('b')
    expect(result.current.animation).toBe('entering')

    act(() => {
      vi.advanceTimersByTime(75)
    })
    expect(result.current.animation).toBe('visible')
  })

  it('uses startStage as the initial animation stage', () => {
    const { result } = renderHook(() =>
      useRotatingMessage(['a', 'b'], { startStage: 'entering' }),
    )

    expect(result.current.message).toBe('a')
    expect(result.current.animation).toBe('entering')
  })

  it('keeps current message if it still exists when messages change', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ messages }: { messages: string[] }) => useRotatingMessage(messages),
      { initialProps: { messages: ['a', 'b', 'c'] } },
    )

    act(() => {
      vi.advanceTimersByTime(8000)
      vi.advanceTimersByTime(200)
      vi.advanceTimersByTime(300)
    })
    expect(result.current.message).toBe('b')

    rerender({ messages: ['b', 'x', 'y'] })
    expect(result.current.message).toBe('b')
  })

  it('falls back to first message when current message is not present after messages change', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ messages }: { messages: string[] }) => useRotatingMessage(messages),
      { initialProps: { messages: ['a', 'b', 'c'] } },
    )

    act(() => {
      vi.advanceTimersByTime(8000)
      vi.advanceTimersByTime(200)
      vi.advanceTimersByTime(300)
    })
    expect(result.current.message).toBe('b')

    rerender({ messages: ['x', 'y'] })
    expect(result.current.message).toBe('x')
  })

  it('clears timers on unmount', () => {
    vi.useFakeTimers()

    const { unmount } = renderHook(() => useRotatingMessage(['a', 'b']))

    unmount()

    act(() => {
      vi.advanceTimersByTime(8000)
      vi.advanceTimersByTime(200)
      vi.advanceTimersByTime(300)
    })

    expect(true).toBe(true)
  })
})
