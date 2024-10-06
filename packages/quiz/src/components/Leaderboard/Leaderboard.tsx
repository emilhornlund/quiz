import React, { FC } from 'react'

import { classNames } from '../../utils/helpers.ts'

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
      ? values
      : values.length >= 3
        ? values.slice(3, values.length)
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
            {!!streaks && (
              <div className={styles.streaks}>
                <span>{streaks}</span>
              </div>
            )}
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
