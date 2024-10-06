import {
  faCircleQuestion,
  faGear,
  faLockOpen,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC } from 'react'

import Button from '../Button'

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
    <div className={styles.actions}>
      <Button
        id="settings-icon-button"
        type="button"
        kind="plain"
        size="small"
        icon={faGear}
      />
    </div>
  </div>
)

export default HostGameFooter
