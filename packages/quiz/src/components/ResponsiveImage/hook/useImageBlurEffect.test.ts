import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useImageBlurEffect } from './useImageBlurEffect'

type CDE = {
  serverTime: string
  initiatedTime: string
  expiryTime: string
}

const makeCountdown = (
  base: Date,
  {
    serverOffsetMs = 0,
    initiatedAgoMs = 2000,
    expiresInMs = 2000,
  }: {
    serverOffsetMs?: number
    initiatedAgoMs?: number
    expiresInMs?: number
  } = {},
): CDE => ({
  serverTime: new Date(base.getTime() + serverOffsetMs).toISOString(),
  initiatedTime: new Date(base.getTime() - initiatedAgoMs).toISOString(),
  expiryTime: new Date(base.getTime() + expiresInMs).toISOString(),
})

describe('useImageBlurEffect (deterministic)', () => {
  const BASE = new Date('2025-01-01T00:00:00.000Z')

  let originalRAF: typeof globalThis.requestAnimationFrame
  let originalCAF: typeof globalThis.cancelAnimationFrame

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE)

    originalRAF = globalThis.requestAnimationFrame
    originalCAF = globalThis.cancelAnimationFrame

    const rafMap = new Map<number, number>()
    let rafSeq = 1

    globalThis.requestAnimationFrame = (cb: FrameRequestCallback): number => {
      const rafId = rafSeq++
      const timeoutId = setTimeout(() => {
        rafMap.delete(rafId)
        cb(performance.now())
      }, 16) as unknown as number
      rafMap.set(rafId, timeoutId)
      return rafId
    }

    globalThis.cancelAnimationFrame = (rafId: number) => {
      const timeoutId = rafMap.get(rafId)
      if (timeoutId != null) {
        clearTimeout(timeoutId as unknown as number)
        rafMap.delete(rafId)
      }
    }
  })

  afterEach(() => {
    vi.useRealTimers()
    globalThis.requestAnimationFrame = originalRAF
    globalThis.cancelAnimationFrame = originalCAF
  })

  const opts = {
    unit: { mode: 'rem', max: 5 },
    ease: (t: number) => t,
  } as const

  it('returns 0 blur when no countdown (no animation running)', () => {
    const { result } = renderHook(() =>
      useImageBlurEffect(undefined, undefined, opts),
    )
    expect(result.current).toEqual({
      filter: 'blur(0.00rem)',
      blur: 0,
    })
  })

  it('computes initial blur with aligned server time (no offset)', () => {
    const countdown = makeCountdown(BASE)
    const { result } = renderHook(() =>
      useImageBlurEffect(undefined, countdown, opts),
    )
    expect(result.current).toEqual({
      filter: 'blur(2.50rem)',
      blur: 2.5,
    })
  })

  it('decreases blur over time and reaches exactly 0.00rem at expiry', () => {
    const countdown = makeCountdown(BASE)
    const { result } = renderHook(() =>
      useImageBlurEffect(undefined, countdown, opts),
    )

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current).toEqual({
      filter: 'blur(1.26rem)',
      blur: 1.26,
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current).toEqual({
      filter: 'blur(0.00rem)',
      blur: 0,
    })

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current).toEqual({
      filter: 'blur(0.00rem)',
      blur: 0,
    })
  })

  it('respects client-to-server time offset when server is ahead', () => {
    const countdown = makeCountdown(BASE, { serverOffsetMs: 1000 })
    const { result } = renderHook(() =>
      useImageBlurEffect(undefined, countdown, opts),
    )
    expect(result.current).toEqual({
      filter: 'blur(1.25rem)',
      blur: 1.25,
    })
  })

  it('cleans up its animation frame on unmount', () => {
    const countdown = makeCountdown(BASE)
    const cancelSpy = vi.spyOn(global, 'cancelAnimationFrame')

    const { unmount } = renderHook(() =>
      useImageBlurEffect(undefined, countdown, opts),
    )
    act(() => {
      vi.advanceTimersByTime(100)
    })

    unmount()
    expect(cancelSpy).toHaveBeenCalled()
    cancelSpy.mockRestore()
  })
})
