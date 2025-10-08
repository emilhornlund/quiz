import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC } from 'react'

import styles from './NonInteractiveInfoBox.module.scss'

export type NonInteractiveInfoBoxProps = {
  info: string
}

const NonInteractiveInfoBox: FC<NonInteractiveInfoBoxProps> = ({ info }) => {
  return (
    <div className={styles.nonInteractiveInfoBox}>
      <FontAwesomeIcon icon={faCircleInfo} />
      <span>{info}</span>
    </div>
  )
}

export default NonInteractiveInfoBox
