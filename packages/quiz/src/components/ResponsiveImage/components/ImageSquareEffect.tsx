import { CountdownEvent, QuestionImageRevealEffectType } from '@quiz/common'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'

export type ImageSquareEffectProps = {
  countdown?: CountdownEvent
  effect:
    | QuestionImageRevealEffectType.Square3x3
    | QuestionImageRevealEffectType.Square5x5
    | QuestionImageRevealEffectType.Square8x8
}

export const ImageSquareEffect: FC<ImageSquareEffectProps> = ({
  countdown,
  effect,
}) => {
  const n = useMemo(() => {
    switch (effect) {
      case QuestionImageRevealEffectType.Square3x3:
        return 3
      case QuestionImageRevealEffectType.Square5x5:
        return 5
      case QuestionImageRevealEffectType.Square8x8:
        return 8
    }
  }, [effect])

  const totalSquares = useMemo(() => n * n, [n])

  const seed = useMemo(() => {
    if (!countdown) return Date.now()
    const initiated = new Date(countdown.initiatedTime).getTime()
    return Number.isFinite(initiated) ? initiated : Date.now()
  }, [countdown])

  const rng = useMemo(() => {
    let t = seed >>> 0 || 1
    return () => {
      t += 0x6d2b79f5
      let r = Math.imul(t ^ (t >>> 15), 1 | t)
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296
    }
  }, [seed])

  const { rank } = useMemo(() => {
    const arr = Array.from({ length: totalSquares }, (_, i) => i)
    // Fisher–Yates with seeded RNG
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    const rnk = new Array<number>(totalSquares)
    for (let pos = 0; pos < totalSquares; pos++) rnk[arr[pos]] = pos
    return { rank: rnk }
  }, [totalSquares, rng])

  const [coveredCount, setCoveredCount] = useState(totalSquares)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setCoveredCount(totalSquares)
  }, [totalSquares, seed])

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
      setCoveredCount(0)
      return
    }

    const clientToServerOffset = serverTime - Date.now()
    const totalDuration = expiry - initiated
    if (totalDuration <= 0) {
      setCoveredCount(0)
      return
    }

    const tick = () => {
      const now = Date.now() + clientToServerOffset
      const elapsed = now - initiated
      const progress = Math.min(elapsed / totalDuration, 1)

      // tiles removed = how many should be revealed so far
      const removed = Math.floor(progress * totalSquares)
      setCoveredCount(Math.max(totalSquares - removed, 0))
    }

    tick()
    intervalRef.current = setInterval(tick, 200)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [countdown, totalSquares])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: `repeat(${n}, 1fr)`,
        gridTemplateRows: `repeat(${n}, 1fr)`,
        width: '100%',
        height: '100%',
      }}>
      {Array.from({ length: totalSquares }).map((_, index) => {
        const isCovered = rank[index] < coveredCount
        return (
          <div
            key={index}
            style={{
              width: '100%',
              height: '100%',
              background: isCovered ? 'white' : 'transparent',
            }}
          />
        )
      })}
    </div>
  )
}
