import React from 'react'
import { useNavigate } from 'react-router-dom'

import Avatar from '../../assets/images/avatar.svg'
import { classNames } from '../../utils/helpers'

import styles from './Page.module.scss'

export interface PageProps {
  width?: 'small' | 'medium' | 'full'
  height?: 'normal' | 'full'
  align?: 'start' | 'center' | 'space-between'
  noPadding?: boolean
  profile?: boolean
  header?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode | React.ReactNode[]
}

const Page: React.FC<PageProps> = ({
  width = 'full',
  height = 'normal',
  align = 'center',
  noPadding = false,
  profile = false,
  header,
  footer,
  children,
}) => {
  const navigate = useNavigate()

  return (
    <div className={styles.main}>
      <div className={classNames(styles.header)}>
        <button className={styles.logo} onClick={() => navigate('/')}>
          <span className={styles.icon} />
          <span className={styles.text}>Quiz</span>
        </button>
        <div className={styles.side}>
          {header}
          {profile && (
            <div className={styles.avatar}>
              <button type="button" onClick={() => navigate('/player/profile')}>
                <img src={Avatar} alt="Profile" />
              </button>
            </div>
          )}
        </div>
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
