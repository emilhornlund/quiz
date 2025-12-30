import { useLayoutEffect, useState } from 'react'

import type { DeviceType } from './device-size.types'
import { DeviceType as DeviceTypeValue } from './device-size.types'

/**
 * React hook that determines the current `DeviceType` based on `window.innerWidth`.
 *
 * Behavior:
 * - Evaluates immediately on mount and whenever the window is resized.
 * - Breakpoints:
 *   - `< 768px`: `DeviceType.Mobile`
 *   - `768px–1023px`: `DeviceType.Tablet`
 *   - `≥ 1024px`: `DeviceType.Desktop`
 * - Returns `undefined` before the first effect runs (e.g., during SSR).
 *
 * @returns The current `DeviceType` (`Mobile`, `Tablet`, or `Desktop`).
 */
export const useDeviceSizeType = (): DeviceType | undefined => {
  const [type, setType] = useState<DeviceType>()

  useLayoutEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 0 && window.innerWidth < 768) {
        setType(DeviceTypeValue.Mobile)
      } else if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setType(DeviceTypeValue.Tablet)
      } else {
        setType(DeviceTypeValue.Desktop)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return type
}
