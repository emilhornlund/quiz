import React, { FC, ReactNode, useEffect, useState } from 'react'

import { classNames } from '../../utils/helpers.ts'

import styles from './Badge.module.scss'

export type BadgeSize = 'small' | 'large'

const BadgeSizeClassName: { [key in BadgeSize]: string } = {
  small: styles.small,
  large: styles.large,
}

export type BadgeBackgroundColor =
  | 'green'
  | 'red'
  | 'orange'
  | 'gold'
  | 'silver'
  | 'bronze'
  | 'white'

const BadgeBackgroundColorClassName: { [key in BadgeBackgroundColor]: string } =
  {
    green: styles.green,
    red: styles.red,
    orange: styles.orange,
    gold: styles.gold,
    silver: styles.silver,
    bronze: styles.bronze,
    white: styles.white,
  }

export type BadgeCelebration = 'none' | 'normal' | 'major' | 'epic'

const BadgeCelebrationClassName: { [key in BadgeCelebration]: string } = {
  none: '',
  normal: styles.celebrationNormal,
  major: styles.celebrationMajor,
  epic: styles.celebrationEpic,
}

export interface BadgeProps {
  size?: BadgeSize
  backgroundColor?: BadgeBackgroundColor
  celebration?: BadgeCelebration
  onAnimationEnd?: () => void
  children?: ReactNode
}

const Badge: FC<BadgeProps> = ({
  size = 'small',
  backgroundColor = 'white',
  celebration = 'none',
  onAnimationEnd,
  children,
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (celebration && celebration !== 'none') {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        onAnimationEnd?.()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [celebration, onAnimationEnd])

  return (
    <div
      className={classNames(
        styles.badge,
        BadgeSizeClassName[size],
        BadgeBackgroundColorClassName[backgroundColor],
        isAnimating ? BadgeCelebrationClassName[celebration] : '',
      )}>
      {children}
    </div>
  )
}

export default Badge
