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

  it('returns default blur and clipPath when no countdown', () => {
    const { result } = renderHook(() => useImageBlurEffect())
    expect(result.current).toEqual({
      filter: 'blur(5.00rem)',
      clipPath: 'inset(2px)',
    })
  })

  it('computes initial blur with aligned server time (no offset)', () => {
    // Duration = 4s (initiated 2s ago, expires in 2s)
    // Elapsed = 2s => blur = ((4-2)/4)*5 = 2.5
    const countdown = makeCountdown(BASE)
    const { result } = renderHook(() => useImageBlurEffect(countdown))
    expect(result.current).toEqual({
      filter: 'blur(2.50rem)',
      clipPath: 'inset(2px)',
    })
  })

  it('decreases blur over time and reaches exactly 0.00rem at expiry', () => {
    const countdown = makeCountdown(BASE)
    const { result } = renderHook(() => useImageBlurEffect(countdown))

    // After 1s: elapsed = 3s of 4s => blur = ((1)/4)*5 = 1.25
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current).toEqual({
      filter: 'blur(1.25rem)',
      clipPath: 'inset(2px)',
    })

    // After another 1s: elapsed >= 4s => blur = 0.00
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current).toEqual({
      filter: 'blur(0.00rem)',
      clipPath: 'inset(2px)',
    })

    // Stays at zero even if more time passes
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current).toEqual({
      filter: 'blur(0.00rem)',
      clipPath: 'inset(2px)',
    })
  })

  it('respects client-to-server time offset when server is ahead', () => {
    // Server is +1s ahead of client
    // With the same initiated/expiry, initial elapsed becomes 3s => blur = 1.25
    const countdown = makeCountdown(BASE, { serverOffsetMs: 1000 })
    const { result } = renderHook(() => useImageBlurEffect(countdown))

    expect(result.current).toEqual({
      filter: 'blur(1.25rem)',
      clipPath: 'inset(2px)',
    })
  })

  it('cleans up its interval on unmount', () => {
    const countdown = makeCountdown(BASE)
    const clearSpy = vi.spyOn(global, 'clearInterval')

    const { unmount } = renderHook(() => useImageBlurEffect(countdown))
    // Ensure the interval was established
    act(() => {
      vi.advanceTimersByTime(100)
    })

    unmount()
    expect(clearSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
  })
})
