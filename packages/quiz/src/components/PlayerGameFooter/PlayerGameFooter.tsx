import React, { FC } from 'react'

import styles from './PlayerGameFooter.module.scss'

export interface PlayerGameFooterProps {
  currentQuestion: number
  totalQuestions: number
  nickname: string
  totalScore: number
}

const PlayerGameFooter: FC<PlayerGameFooterProps> = ({
  currentQuestion,
  totalQuestions,
  nickname,
  totalScore,
}) => (
  <div className={styles.main}>
    <div className={styles.questions}>
      {currentQuestion} / {totalQuestions}
    </div>
    <div className={styles.nickname}>{nickname}</div>
    <div className={styles.score}>
      <span>{totalScore}</span>
    </div>
  </div>
)

export default PlayerGameFooter
