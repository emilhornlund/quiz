import type { CountdownEvent } from '@klurigo/common'
import { useEffect, useMemo, useRef, useState } from 'react'

type Box = { w: number; h: number }

type BlurUnit =
  /** Ratio of min(box.w, box.h), e.g. 0.05 → 5% of shortest side */
  | { mode: 'auto'; ratio?: number }
  /** Fixed maximum blur in px */
  | { mode: 'px'; max: number }
  /** Fixed maximum blur in rem */
  | { mode: 'rem'; max: number }

type Options = {
  /** Fraction of the total duration to *not* animate (e.g. 0.1 => stop blur with 10% time left). */
  endAt?: number
  /** Choose how to express max blur. Default is auto with 5% of the shortest side. */
  unit?: BlurUnit
  /** Easing. Replace with t => t for linear. */
  ease?: (t: number) => number
  /** Min change before we commit a re-render (prevents thrash). */
  epsilon?: number
  /** rAF tick cap in ms; 0 = every frame. */
  minFrameMs?: number
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export function useImageBlurEffect(
  box?: Box,
  countdown?: CountdownEvent,
  {
    endAt = 0,
    unit = { mode: 'auto', ratio: 0.05 },
    ease = easeOutCubic,
    epsilon = 0.01,
    minFrameMs = 0,
  }: Options = {},
) {
  const [blurValue, setBlurValue] = useState(0)
  const [clientToServerOffset, setOffset] = useState(0)
  const [initiatedAt, setInitiatedAt] = useState(0)
  const [totalSec, setTotalSec] = useState(0)

  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef(0)

  const { maxBlurNumber, unitSuffix } = useMemo(() => {
    if (unit.mode === 'auto') {
      const ratio = unit.ratio ?? 0.05
      const px = box ? Math.max(Math.min(box.w, box.h) * ratio, 0) : 16
      return { maxBlurNumber: px, unitSuffix: 'px' }
    }
    if (unit.mode === 'px') {
      return { maxBlurNumber: Math.max(unit.max, 0), unitSuffix: 'px' }
    }
    return { maxBlurNumber: Math.max(unit.max, 0), unitSuffix: 'rem' }
  }, [unit, box])

  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (!countdown) return

    const serverTime = new Date(countdown.serverTime).getTime()
    const initiated = new Date(countdown.initiatedTime).getTime()
    const expiry = new Date(countdown.expiryTime).getTime()

    const offset = serverTime - Date.now()
    setOffset(offset)

    const durationSec = Math.max((expiry - initiated) / 1000, 0.001)
    setTotalSec(durationSec)
    setInitiatedAt(initiated)

    const now = Date.now() + offset
    const elapsedSec = (now - initiated) / 1000
    const effectiveSec = durationSec * (1 - Math.max(0, Math.min(endAt, 0.99)))
    const clamped = Math.max(0, Math.min(elapsedSec / effectiveSec, 1))
    const progress = ease(clamped)
    const initial = Math.max((1 - progress) * maxBlurNumber, 0)
    setBlurValue(initial)
  }, [countdown, endAt, ease, maxBlurNumber])

  useEffect(() => {
    if (!initiatedAt || !totalSec) return

    const effectiveSec = totalSec * (1 - Math.max(0, Math.min(endAt, 0.99)))

    const tick = (ts: number) => {
      if (minFrameMs > 0 && ts - lastTsRef.current < minFrameMs) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      lastTsRef.current = ts

      const now = Date.now() + clientToServerOffset
      const elapsedSec = (now - initiatedAt) / 1000

      let blur = 0
      if (elapsedSec < effectiveSec) {
        const clamped = Math.max(0, Math.min(elapsedSec / effectiveSec, 1))
        const progress = ease(clamped)
        blur = Math.max((1 - progress) * maxBlurNumber, 0)
      } else {
        blur = 0
      }

      setBlurValue((prev) => (Math.abs(prev - blur) > epsilon ? blur : prev))

      if (elapsedSec < totalSec) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [
    clientToServerOffset,
    initiatedAt,
    totalSec,
    endAt,
    ease,
    maxBlurNumber,
    epsilon,
    minFrameMs,
  ])

  const filter = useMemo(
    () => `blur(${blurValue.toFixed(2)}${unitSuffix})`,
    [blurValue, unitSuffix],
  )

  return { filter, blur: blurValue }
}
