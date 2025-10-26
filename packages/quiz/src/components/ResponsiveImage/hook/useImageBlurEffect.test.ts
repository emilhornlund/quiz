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

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns default blur when no countdown', () => {
    const { result } = renderHook(() => useImageBlurEffect())
    expect(result.current).toEqual({
      filter: 'blur(5.00rem)',
    })
  })

  it('computes initial blur with aligned server time (no offset)', () => {
    const countdown = makeCountdown(BASE)
    const { result } = renderHook(() => useImageBlurEffect(countdown))
    expect(result.current).toEqual({
      filter: 'blur(2.50rem)',
    })
  })

  it('decreases blur over time and reaches exactly 0.00rem at expiry', () => {
    const countdown = makeCountdown(BASE)
    const { result } = renderHook(() => useImageBlurEffect(countdown))

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current).toEqual({
      filter: 'blur(1.25rem)',
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current).toEqual({
      filter: 'blur(0.00rem)',
    })

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current).toEqual({
      filter: 'blur(0.00rem)',
    })
  })

  it('respects client-to-server time offset when server is ahead', () => {
    const countdown = makeCountdown(BASE, { serverOffsetMs: 1000 })
    const { result } = renderHook(() => useImageBlurEffect(countdown))

    expect(result.current).toEqual({
      filter: 'blur(1.25rem)',
    })
  })

  it('cleans up its interval on unmount', () => {
    const countdown = makeCountdown(BASE)
    const clearSpy = vi.spyOn(global, 'clearInterval')

    const { unmount } = renderHook(() => useImageBlurEffect(countdown))
    act(() => {
      vi.advanceTimersByTime(100)
    })

    unmount()
    expect(clearSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
  })
})
