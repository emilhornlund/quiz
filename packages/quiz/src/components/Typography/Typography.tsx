import React, { FC, ReactNode } from 'react'

import { classNames } from '../../utils/helpers.ts'

import styles from './Typography.module.scss'

export interface TypographyProps {
  variant?: 'title' | 'subtitle' | 'text' | 'link'
  size?: 'small' | 'medium' | 'full'
  children: ReactNode | ReactNode[]
}

const Typography: FC<TypographyProps> = ({
  variant = 'text',
  size = 'full',
  children,
}) => (
  <div
    className={classNames(
      styles.typography,
      variant === 'title' ? styles.title : undefined,
      variant === 'subtitle' ? styles.subtitle : undefined,
      variant === 'text' ? styles.text : undefined,
      variant === 'link' ? styles.link : undefined,
      size === 'small' ? styles.small : undefined,
      size === 'medium' ? styles.medium : undefined,
      size === 'full' ? styles.full : undefined,
    )}>
    {children}
  </div>
)

export default Typography
