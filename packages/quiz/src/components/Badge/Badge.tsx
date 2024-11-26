import React, { FC, ReactNode } from 'react'

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

export interface BadgeProps {
  size?: BadgeSize
  backgroundColor?: BadgeBackgroundColor
  children?: ReactNode
}

const Badge: FC<BadgeProps> = ({
  size = 'small',
  backgroundColor = 'white',
  children,
}) => (
  <div
    className={classNames(
      styles.badge,
      BadgeSizeClassName[size],
      BadgeBackgroundColorClassName[backgroundColor],
    )}>
    {children}
  </div>
)

export default Badge
