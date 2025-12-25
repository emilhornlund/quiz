import { faCircleQuestion, faLockOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { FC } from 'react'

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
      <FontAwesomeIcon icon={faCircleQuestion} />
      <span>
        {currentQuestion} / {totalQuestions}
      </span>
    </div>
    <div className={styles.gamePIN}>
      <FontAwesomeIcon icon={faLockOpen} />
      <span>{gamePIN}</span>
    </div>
    <div className={styles.actions} />
  </div>
)

export default HostGameFooter
