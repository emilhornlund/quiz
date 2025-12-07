import React, { FC } from 'react'

import { classNames } from '../../utils/helpers.ts'
import StreakBadge from '../StreakBadge'

import styles from './Leaderboard.module.scss'

export interface LeaderboardProps {
  values: {
    position: number
    nickname: string
    score: number
    streaks?: number
  }[]
  includePodium?: boolean
}

const Leaderboard: FC<LeaderboardProps> = ({
  values,
  includePodium = true,
}) => {
  const displayedValues = includePodium
    ? values.slice(0, 5)
    : values.length >= 3
      ? values.slice(3, 5)
      : []

  return (
    <div className={styles.main}>
      {displayedValues.map(({ position, nickname, score, streaks }, index) => {
        const rowStyle = { '--row-index': index } as React.CSSProperties
        return (
          <React.Fragment key={`${position}_${nickname}_${score}`}>
            <div
              className={classNames(
                styles.column,
                includePodium ? styles.podium : undefined,
              )}
              style={rowStyle}>
              <div className={styles.position}>
                <span>{position}</span>
              </div>
            </div>
            <div
              className={classNames(
                styles.column,
                includePodium ? styles.podium : undefined,
              )}
              style={rowStyle}>
              <div className={styles.nameRow}>
                <span>{nickname}</span>
                <StreakBadge streak={streaks} />
              </div>
            </div>
            <div
              className={classNames(
                styles.column,
                includePodium ? styles.podium : undefined,
              )}
              style={rowStyle}>
              <span className={styles.score}>{score}</span>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default Leaderboard
