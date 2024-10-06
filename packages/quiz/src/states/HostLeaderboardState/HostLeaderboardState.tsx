import { GameEventLeaderboardHost } from '@quiz/common'
import React, { FC } from 'react'

import { HostGameFooter, IconButtonArrowRight, Page } from '../../components'

import styles from './HostLeaderboardState.module.scss'

export interface HostLeaderboardStateProps {
  event: GameEventLeaderboardHost
}

const HostLeaderboardState: FC<HostLeaderboardStateProps> = ({
  event: {
    gamePIN,
    leaderboard,
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => {
  return (
    <Page
      header={
        <IconButtonArrowRight
          id={'next-button'}
          type="button"
          kind="secondary"
          size="small"
          value="Next"
        />
      }
      footer={
        <HostGameFooter
          gamePIN={gamePIN}
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
        />
      }>
      <div className={styles.main}>
        <div className={styles.title}>Leaderboard</div>
        <div className={styles.leaderboard}>
          {leaderboard.map(({ position, nickname, score }) => (
            <>
              <div key={`position_${position}`} className={styles.column}>
                <div className={styles.position}>
                  <span>{position}</span>
                </div>
              </div>
              <div key={`nickname_${position}`} className={styles.column}>
                {nickname}
              </div>
              <div key={`score_${position}`} className={styles.column}>
                <span className={styles.score}>{score}</span>
              </div>
            </>
          ))}
        </div>
      </div>
    </Page>
  )
}

export default HostLeaderboardState
