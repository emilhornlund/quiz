import { CountdownEvent } from '@quiz/common/src'
import React, { FC, useEffect, useRef, useState } from 'react'

import styles from './ProgressBar.module.scss'

export interface ProgressBarProps {
  countdown: CountdownEvent
}

const calculateClientToServerOffset = (
  serverTime: string,
  clientReceiveTime: number,
): number => {
  const serverTimestamp = new Date(serverTime).getTime()
  return serverTimestamp - clientReceiveTime
}

const calculateRemainingTime = (expiryTime: number, offset: number): number => {
  const adjustedClientTime = Date.now() + offset
  return expiryTime - adjustedClientTime
}

const ProgressBar: FC<ProgressBarProps> = ({ countdown }) => {
  const [progress, setProgress] = useState<number>(1)

  const clientToServerOffsetRef = useRef<number>(0)
  const expiryTimeRef = useRef<number>(0)
  const totalDurationRef = useRef<number>(0)
  const isFirstEventRef = useRef<boolean>(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const clientReceiveTime = Date.now()
    const serverTimeDate = new Date(countdown.serverTime)
    const expiryTimeDate = new Date(countdown.expiryTime)

    if (isNaN(serverTimeDate.getTime()) || isNaN(expiryTimeDate.getTime())) {
      setProgress(0)
      return
    }

    const serverTime = serverTimeDate.getTime()
    const expiryTime = expiryTimeDate.getTime()

    clientToServerOffsetRef.current = calculateClientToServerOffset(
      countdown.serverTime,
      clientReceiveTime,
    )

    expiryTimeRef.current = expiryTime

    if (isFirstEventRef.current) {
      totalDurationRef.current = expiryTime - serverTime
      isFirstEventRef.current = false
    }
  }, [countdown])

  useEffect(() => {
    if (intervalRef.current !== null) {
      return
    }

    intervalRef.current = setInterval(() => {
      if (expiryTimeRef.current === 0 || totalDurationRef.current === 0) {
        setProgress(0)
        return
      }

      const remainingTime = calculateRemainingTime(
        expiryTimeRef.current,
        clientToServerOffsetRef.current,
      )
      const newProgress =
        totalDurationRef.current > 0
          ? Math.max(remainingTime / totalDurationRef.current, 0)
          : 0
      setProgress(newProgress)

      if (remainingTime <= 0) {
        setProgress(0)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }, 100)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  return (
    <div className={styles.progressBar}>
      <span
        style={{
          width: `${Math.max(Math.min(1, progress), 0) * 100}%`,
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  )
}

export default ProgressBar
