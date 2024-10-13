import React from 'react'

import { classNames } from '../../utils/helpers'

import styles from './Page.module.scss'

export interface PageProps {
  width?: 'small' | 'medium' | 'full'
  height?: 'normal' | 'full'
  align?: 'start' | 'center' | 'space-between'
  noPadding?: boolean
  header?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode | React.ReactNode[]
}

const Page: React.FC<PageProps> = ({
  width = 'full',
  height = 'normal',
  align = 'center',
  noPadding = false,
  header,
  footer,
  children,
}) => {
  return (
    <div className={styles.main}>
      <div className={classNames(styles.header)}>
        <div className={styles.logo}>
          <span className={styles.icon} />
          <span className={styles.text}>Quiz</span>
        </div>
        <div className={styles.side}>{header}</div>
      </div>
      <div
        className={classNames(
          styles.content,
          width === 'small' ? styles.smallWidth : undefined,
          width === 'medium' ? styles.mediumWidth : undefined,
          width === 'full' ? styles.fullWidth : undefined,
          height === 'full' ? styles.fullHeight : undefined,
          align === 'start' ? styles.startAlign : undefined,
          align === 'center' ? styles.centerAlign : undefined,
          align === 'space-between' ? styles.spaceBetweenAlign : undefined,
          noPadding ? styles.noPadding : undefined,
        )}>
        {children}
      </div>
      {footer && <div className={classNames(styles.footer)}>{footer}</div>}
    </div>
  )
}

export default Page
