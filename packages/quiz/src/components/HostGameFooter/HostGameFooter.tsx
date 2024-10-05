import React, { FC } from 'react'

import styles from './HostGameFooter.module.scss'

export interface HostGameFooterProps {
  gamePIN: string
  currentQuestion: number
  totalQuestions: number
}

const HostGameFooter: FC<HostGameFooterProps> = ({
  gamePIN,
  currentQuestion,
  totalQuestions,
}) => (
  <div className={styles.main}>
    <div className={styles.questions}>
      {currentQuestion} / {totalQuestions}
    </div>
    <div className={styles.gamePIN}>
      Game PIN: <span>{gamePIN}</span>
    </div>
    <div className={styles.actions} />
  </div>
)

export default HostGameFooter
