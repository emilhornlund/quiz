import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useImageBlurEffect } from './useImageBlurEffect'

const countdown = {
  serverTime: new Date().toISOString(),
  initiatedTime: new Date(Date.now() - 2000).toISOString(),
  expiryTime: new Date(Date.now() + 2000).toISOString(),
}

describe('useImageBlurEffect', () => {
  it('returns default filter and clipPath when no countdown', () => {
    const { result } = renderHook(() => useImageBlurEffect())
    expect(result.current).toMatchSnapshot()
  })

  it('returns filter and clipPath with countdown', () => {
    const { result } = renderHook(() => useImageBlurEffect(countdown))
    expect(result.current).toMatchSnapshot()
  })
})
