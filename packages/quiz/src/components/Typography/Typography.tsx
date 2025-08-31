import React, { FC, ReactNode } from 'react'

import { classNames } from '../../utils/helpers.ts'

import styles from './Typography.module.scss'

export interface TypographyProps {
  variant?: 'title' | 'subtitle' | 'text' | 'link' | 'hero'
  size?: 'small' | 'medium' | 'full'
  children: ReactNode | ReactNode[]
}

const Typography: FC<TypographyProps> = ({
  variant = 'text',
  size = 'full',
  children,
}) => {
  const getElement = () => {
    switch (variant) {
      case 'hero':
      case 'title':
        return 'h1'
      case 'subtitle':
        return 'h2'
      case 'link':
        return 'a'
      default:
        return 'div'
    }
  }

  return React.createElement(
    getElement(),
    {
      className: classNames(
        styles.typography,
        variant === 'title' ? styles.title : undefined,
        variant === 'subtitle' ? styles.subtitle : undefined,
        variant === 'text' ? styles.text : undefined,
        variant === 'link' ? styles.link : undefined,
        variant === 'hero' ? styles.hero : undefined,
        size === 'small' ? styles.small : undefined,
        size === 'medium' ? styles.medium : undefined,
        size === 'full' ? styles.full : undefined,
      ),
    },
    children,
  )
}

export default Typography
