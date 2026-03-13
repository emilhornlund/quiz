import { useMemo } from 'react'

import { DeviceType } from '../device-size.types'
import { useDeviceSizeType } from '../useDeviceSizeType'

/**
 * Responsive page size values for desktop, tablet, and mobile devices.
 */
export type ResponsivePageSizeOptions = {
  /** The page size to use on desktop devices. */
  readonly desktop: number
  /** The page size to use on tablet devices. */
  readonly tablet: number
  /** The page size to use on mobile devices. */
  readonly mobile: number
}

/**
 * Returns a page size based on the current device type.
 */
export const useResponsivePageSize = (
  options: ResponsivePageSizeOptions = {
    desktop: 20,
    tablet: 15,
    mobile: 10,
  },
): number | undefined => {
  const deviceType = useDeviceSizeType()

  return useMemo(() => {
    if (deviceType === DeviceType.Desktop) return options.desktop
    if (deviceType === DeviceType.Tablet) return options.tablet
    if (deviceType === DeviceType.Mobile) return options.mobile
    return undefined
  }, [options.desktop, options.mobile, options.tablet, deviceType])
}
