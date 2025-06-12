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
}) => (
  <div className={styles.main}>
    {(includePodium
      ? values.slice(0, 5)
      : values.length >= 3
        ? values.slice(3, 5)
        : []
    ).map(({ position, nickname, score, streaks }) => (
      <React.Fragment key={`${position}_${nickname}_${score}`}>
        <div
          className={classNames(
            styles.column,
            includePodium ? styles.podium : undefined,
          )}>
          <div className={styles.position}>
            <span>{position}</span>
          </div>
        </div>
        <div
          className={classNames(
            styles.column,
            includePodium ? styles.podium : undefined,
          )}>
          <div className={styles.row}>
            <span>{nickname}</span>
            <StreakBadge streak={streaks} />
          </div>
        </div>
        <div
          className={classNames(
            styles.column,
            includePodium ? styles.podium : undefined,
          )}>
          <span className={styles.score}>{score}</span>
        </div>
      </React.Fragment>
    ))}
  </div>
)

export default Leaderboard
