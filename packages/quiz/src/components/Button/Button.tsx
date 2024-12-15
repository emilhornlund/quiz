import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

import { classNames } from '../../utils/helpers'

import styles from './Button.module.scss'

export interface ButtonProps {
  id: string
  name?: string
  type: 'submit' | 'reset' | 'button'
  kind?: 'primary' | 'secondary' | 'call-to-action' | 'plain' | 'destructive'
  size?: 'normal' | 'small'
  value?: React.ReactNode | string | undefined
  disabled?: boolean
  icon?: IconDefinition
  iconPosition?: 'leading' | 'trailing'
  iconColor?: string
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
  icon,
  iconPosition = 'leading',
  iconColor,
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
          kind === 'call-to-action' ? styles.callToAction : undefined,
          kind === 'plain' ? styles.plain : undefined,
          kind === 'destructive' ? styles.destructive : undefined,
        )}
        data-testid={`test-${id}-button`}>
        {icon && iconPosition === 'leading' && (
          <FontAwesomeIcon icon={icon} color={iconColor} />
        )}
        {!!value && <span>{value}</span>}
        {icon && iconPosition === 'trailing' && (
          <FontAwesomeIcon icon={icon} color={iconColor} />
        )}
      </button>
    </div>
  )
}

export default Button
