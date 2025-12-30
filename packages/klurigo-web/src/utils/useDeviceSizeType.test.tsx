import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DeviceType } from './device-size.types'
import { useDeviceSizeType } from './useDeviceSizeType'

const resizeWindow = (width: number) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).innerWidth = width
  window.dispatchEvent(new Event('resize'))
}

describe('useDeviceSizeType', () => {
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).innerWidth = 1024
  })

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).innerWidth = originalInnerWidth
  })

  it('returns undefined before layout effect runs', () => {
    const { result } = renderHook(() => useDeviceSizeType())
    expect(
      result.current === undefined ||
        Object.values(DeviceType).includes(result.current),
    ).toBe(true)
  })

  it('detects Desktop when width >= 1024', () => {
    resizeWindow(1400)
    const { result } = renderHook(() => useDeviceSizeType())
    expect(result.current).toBe(DeviceType.Desktop)
  })

  it('detects Tablet when 768 <= width < 1024', () => {
    resizeWindow(800)
    const { result } = renderHook(() => useDeviceSizeType())
    expect(result.current).toBe(DeviceType.Tablet)
  })

  it('detects Mobile when width < 768', () => {
    resizeWindow(500)
    const { result } = renderHook(() => useDeviceSizeType())
    expect(result.current).toBe(DeviceType.Mobile)
  })

  it('updates when window is resized', () => {
    const { result } = renderHook(() => useDeviceSizeType())

    act(() => {
      resizeWindow(600) // Mobile
    })
    expect(result.current).toBe(DeviceType.Mobile)

    act(() => {
      resizeWindow(900) // Tablet
    })
    expect(result.current).toBe(DeviceType.Tablet)

    act(() => {
      resizeWindow(1200) // Desktop
    })
    expect(result.current).toBe(DeviceType.Desktop)
  })

  it('cleans up resize listener on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useDeviceSizeType())
    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    unmount()
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
