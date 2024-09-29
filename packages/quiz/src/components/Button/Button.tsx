import React from 'react'

import { classNames } from '../../utils/helpers'

import styles from './Button.module.scss'

export interface ButtonProps {
  id: string
  name?: string
  type: 'submit' | 'reset' | 'button'
  kind?: 'primary' | 'secondary'
  size?: 'normal' | 'small'
  value: React.ReactNode | string | undefined
  disabled?: boolean
  arrow?: 'left' | 'right'
  onClick?: () => void
}

const Button: React.FC<ButtonProps> = ({
  id,
  name,
  type,
  kind = 'primary',
  size = 'normal',
  value,
  disabled,
  arrow,
  onClick,
}) => {
  return (
    <div
      className={classNames(
        styles.main,
        size === 'small' ? styles.small : undefined,
      )}>
      <button
        id={id}
        name={name ?? id}
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={classNames(
          kind === 'primary' ? styles.primary : undefined,
          kind === 'secondary' ? styles.secondary : undefined,
        )}
        data-testid={`test-${id}-button`}>
        {arrow == 'left' && (
          <div className={classNames(styles.arrow, styles.left)} />
        )}
        {value}
        {arrow == 'right' && (
          <div className={classNames(styles.arrow, styles.right)} />
        )}
      </button>
    </div>
  )
}

export default Button
