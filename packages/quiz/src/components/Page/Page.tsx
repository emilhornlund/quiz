import React from 'react'

import { classNames } from '../../utils/helpers'

import styles from './Page.module.scss'

export interface PageProps {
  fullWidth?: boolean
  center?: boolean
  noPadding?: boolean
  header?: React.ReactNode
  children: React.ReactNode | React.ReactNode[]
}

const Page: React.FC<PageProps> = ({
  fullWidth = false,
  center = true,
  noPadding = false,
  header,
  children,
}) => {
  return (
    <div className={styles.main}>
      <div
        className={classNames(
          styles.header,
          fullWidth ? styles.fullWidth : undefined,
        )}>
        <div className={styles.logo}>
          <span className={styles.icon} />
          <span className={styles.text}>Quiz</span>
        </div>
        <div className={styles.side}>{header}</div>
      </div>
      <div
        className={classNames(
          styles.content,
          fullWidth ? styles.fullWidth : undefined,
          center ? styles.center : undefined,
          noPadding ? styles.noPadding : undefined,
        )}>
        {children}
      </div>
    </div>
  )
}

export default Page
