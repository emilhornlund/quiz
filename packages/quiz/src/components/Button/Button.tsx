import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

import { classNames } from '../../utils/helpers'

import styles from './Button.module.scss'

export interface ButtonProps {
  id: string
  name?: string
  type: 'submit' | 'reset' | 'button'
  kind?: 'primary' | 'secondary' | 'plain'
  size?: 'normal' | 'small'
  value?: React.ReactNode | string | undefined
  disabled?: boolean
  icon?: IconDefinition
  iconPosition?: 'leading' | 'trailing'
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
          kind === 'plain' ? styles.plain : undefined,
        )}
        data-testid={`test-${id}-button`}>
        {icon && iconPosition === 'leading' && <FontAwesomeIcon icon={icon} />}
        {!!value && <span>{value}</span>}
        {icon && iconPosition === 'trailing' && <FontAwesomeIcon icon={icon} />}
      </button>
    </div>
  )
}

export default Button
