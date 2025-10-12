import { CountdownEvent } from '@quiz/common'
import React, { useEffect, useRef, useState } from 'react'

interface ImageEffectProps {
  box: { w: number; h: number }
  countdown?: CountdownEvent
  numberOfSquares: number
}

export const ImageSquareEffect: React.FC<ImageEffectProps> = ({
  box,
  countdown,
  numberOfSquares,
}) => {
  const evenSquares =
    numberOfSquares % 2 === 0 ? numberOfSquares : numberOfSquares + 1

  const [visibleSquares, setVisibleSquares] = useState(evenSquares - 1)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!countdown) return

    const serverTime = new Date(countdown.serverTime).getTime()
    const initiated = new Date(countdown.initiatedTime).getTime()
    const expiry = new Date(countdown.expiryTime).getTime()

    if ([serverTime, initiated, expiry].some((t) => isNaN(t))) {
      setVisibleSquares(0)
      return
    }

    const clientToServerOffset = serverTime - Date.now()
    const totalDuration = expiry - initiated
    if (totalDuration <= 0) {
      setVisibleSquares(0)
      return
    }

    const updateSquares = () => {
      const now = Date.now() + clientToServerOffset
      const elapsed = now - initiated
      const progress = Math.min(elapsed / totalDuration, 1)

      const removed = Math.floor(progress * evenSquares) + 1
      setVisibleSquares(Math.max(evenSquares - removed, 0))
    }

    updateSquares()
    intervalRef.current = setInterval(updateSquares, 200)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [countdown, evenSquares])

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: box.w,
        height: box.h,
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
      }}>
      {Array.from({ length: evenSquares }).map((_, index) => (
        <div
          key={index}
          style={{
            width: `${box.w / (evenSquares / 2)}px`,
            height: `${box.h / 2}px`,
            background: index < visibleSquares ? 'white' : 'transparent',
          }}
        />
      ))}
    </div>
  )
}
