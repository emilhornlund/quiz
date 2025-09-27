import { useLayoutEffect, useState } from 'react'

/**
 * Enum representing device size breakpoints.
 *
 * - `Mobile`: viewport width < 768px
 * - `Tablet`: viewport width between 768px and 1023px
 * - `Desktop`: viewport width ≥ 1024px
 */
export enum DeviceType {
  Mobile = 'MOBILE',
  Tablet = 'TABLET',
  Desktop = 'DESKTOP',
}

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
        setType(DeviceType.Mobile)
      } else if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setType(DeviceType.Tablet)
      } else {
        setType(DeviceType.Desktop)
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
