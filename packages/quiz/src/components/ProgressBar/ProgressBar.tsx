import { CountdownEvent } from '@quiz/common/src'
import React, { FC, useEffect, useState } from 'react'

import styles from './ProgressBar.module.scss'

export interface ProgressBarProps {
  countdown: CountdownEvent
}

function getClientToServerOffset(serverTime: string) {
  const serverDate = new Date(serverTime)
  const initialClientDate = new Date()
  return serverDate.getTime() - initialClientDate.getTime()
}

function calculateTimeRemaining(
  expiryTime: string,
  clientToServerOffset: number,
) {
  const expiryDate = new Date(expiryTime)
  const currentClientDate = new Date()
  const adjustedClientTime = currentClientDate.getTime() + clientToServerOffset
  return expiryDate.getTime() - adjustedClientTime
}

const ProgressBar: FC<ProgressBarProps> = ({ countdown }) => {
  const [progress, setProgress] = useState<number>(1)

  useEffect(() => {
    const clientToServerOffset = getClientToServerOffset(countdown.serverTime)

    const totalDuration =
      new Date(countdown.expiryTime).getTime() -
      new Date(countdown.serverTime).getTime()

    const interval = setInterval(() => {
      const remainingTime = calculateTimeRemaining(
        countdown.expiryTime,
        clientToServerOffset,
      )
      const newProgress = Math.max(remainingTime / totalDuration, 0)
      setProgress(newProgress)

      if (remainingTime <= 0) {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [countdown])

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
