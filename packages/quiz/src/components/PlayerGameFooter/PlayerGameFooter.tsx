import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
      <FontAwesomeIcon icon={faCircleQuestion} />
      <span>
        {currentQuestion} / {totalQuestions}
      </span>
    </div>
    <div className={styles.nickname}>
      <span>{nickname}</span>
    </div>
    <div className={styles.score}>
      <span>{totalScore}</span>
    </div>
  </div>
)

export default PlayerGameFooter
