import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  useDeviceSizeTypeMock: vi.fn(),
}))

vi.mock('../useDeviceSizeType', () => ({
  useDeviceSizeType: () => h.useDeviceSizeTypeMock(),
}))

import { DeviceType } from '../device-size.types'

import { useResponsivePageSize } from './useResponsivePageSize'

const PAGE_SIZE = {
  desktop: 20,
  tablet: 15,
  mobile: 10,
} as const

describe('useResponsivePageSize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns desktop page size', () => {
    h.useDeviceSizeTypeMock.mockReturnValue(DeviceType.Desktop)

    const { result } = renderHook(() => useResponsivePageSize(PAGE_SIZE))

    expect(result.current).toBe(20)
  })

  it('returns tablet page size', () => {
    h.useDeviceSizeTypeMock.mockReturnValue(DeviceType.Tablet)

    const { result } = renderHook(() => useResponsivePageSize(PAGE_SIZE))

    expect(result.current).toBe(15)
  })

  it('returns mobile page size', () => {
    h.useDeviceSizeTypeMock.mockReturnValue(DeviceType.Mobile)

    const { result } = renderHook(() => useResponsivePageSize(PAGE_SIZE))

    expect(result.current).toBe(10)
  })

  it('returns undefined when device type is not resolved', () => {
    h.useDeviceSizeTypeMock.mockReturnValue(undefined)

    const { result } = renderHook(() => useResponsivePageSize(PAGE_SIZE))

    expect(result.current).toBeUndefined()
  })
})
