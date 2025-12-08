import { CountdownEvent } from '@quiz/common'
import React, { FC, useEffect, useRef, useState } from 'react'

import { classNames } from '../../utils/helpers.ts'

import styles from './ProgressBar.module.scss'

export interface ProgressBarProps {
  countdown: CountdownEvent
}

const ProgressBar: FC<ProgressBarProps> = ({ countdown }) => {
  const [progress, setProgress] = useState<number>(1)

  const [clientToServerOffset, setClientToServerOffset] = useState<number>(0)
  const [initiatedTime, setInitiatedTime] = useState<number>(0)
  const [totalDuration, setTotalDuration] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const serverTime = new Date(countdown.serverTime).getTime()
    const tmpInitiatedTime = new Date(countdown.initiatedTime).getTime()
    const expiryTime = new Date(countdown.expiryTime).getTime()

    if ([serverTime, tmpInitiatedTime, expiryTime].some((t) => isNaN(t))) {
      setProgress(0)
      return
    }

    setInitiatedTime(tmpInitiatedTime)

    const tmpClientToServerOffset = serverTime - Date.now()
    setClientToServerOffset(tmpClientToServerOffset)
    const tmpTotalDuration = expiryTime - tmpInitiatedTime
    setTotalDuration(tmpTotalDuration)

    const now = Date.now() + tmpClientToServerOffset
    const elapsed = now - tmpInitiatedTime
    const initialProgress = Math.max(1 - elapsed / tmpTotalDuration, 0)
    setProgress(initialProgress)
  }, [countdown])

  useEffect(() => {
    if (!initiatedTime || !totalDuration || intervalRef.current) return

    intervalRef.current = setInterval(() => {
      const now = Date.now() + clientToServerOffset
      const elapsed = now - initiatedTime

      if (totalDuration <= 0 || elapsed >= totalDuration) {
        setProgress(0)
        clearInterval(intervalRef.current!)
        intervalRef.current = null
        return
      }

      const newProgress = Math.max(1 - elapsed / totalDuration, 0)
      setProgress(newProgress)
    }, 100)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [clientToServerOffset, initiatedTime, totalDuration])

  const getProgressColorClass = () => {
    const percentage = progress * 100
    if (percentage >= 50) return styles.safe
    if (percentage >= 20) return styles.caution
    if (percentage >= 10) return styles.urgent
    return styles.critical
  }

  return (
    <div className={styles.progressBar}>
      <div
        className={classNames(
          styles.track,
          getProgressColorClass(),
          progress < 0.1 ? styles.pulse : undefined,
        )}
        style={{
          width: `${Math.max(Math.min(1, progress), 0) * 100}%`,
          transition:
            'width 0.1s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease',
        }}
      />
    </div>
  )
}

export default ProgressBar
