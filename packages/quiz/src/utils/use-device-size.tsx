import { useLayoutEffect, useState } from 'react'

export enum DeviceType {
  Mobile = 'MOBILE',
  Tablet = 'TABLET',
  Desktop = 'DESKTOP',
}

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
