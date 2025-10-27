import { CountdownEvent } from '@quiz/common'
import { useEffect, useRef, useState } from 'react'

export const useImageBlurEffect = (countdown?: CountdownEvent) => {
  const [blur, setBlur] = useState(5)
  const [clientToServerOffset, setClientToServerOffset] = useState(0)
  const [initiatedTime, setInitiatedTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (!countdown) return

    const serverTime = new Date(countdown.serverTime).getTime()
    const tmpInitiatedTime = new Date(countdown.initiatedTime).getTime()
    const expiryTime = new Date(countdown.expiryTime).getTime()

    const offset = serverTime - Date.now()
    setClientToServerOffset(offset)

    const duration = Math.max((expiryTime - tmpInitiatedTime) / 1000, 1)
    setTotalDuration(duration)
    setInitiatedTime(tmpInitiatedTime)

    const now = Date.now() + offset
    const elapsed = (now - tmpInitiatedTime) / 1000
    const initialBlur = Math.max(((duration - elapsed) / duration) * 5, 0)
    setBlur(initialBlur)
  }, [countdown])

  useEffect(() => {
    if (!initiatedTime || !totalDuration || intervalRef.current) return

    intervalRef.current = setInterval(() => {
      const now = Date.now() + clientToServerOffset
      const elapsed = (now - initiatedTime) / 1000

      if (elapsed >= totalDuration) {
        setBlur(0)
        clearInterval(intervalRef.current!)
        intervalRef.current = null
        return
      }

      const newBlur = Math.max(
        ((totalDuration - elapsed) / totalDuration) * 5,
        0,
      )
      setBlur(newBlur)
    }, 100)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [clientToServerOffset, initiatedTime, totalDuration])

  return {
    filter: `blur(${blur.toFixed(2)}rem)`,
    clipPath: 'inset(2px)',
  }
}
