import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC } from 'react'

import styles from './Select.module.scss'

export interface SelectProps {
  id: string
  name?: string
  value?: string | readonly string[] | number | undefined
  values?: { key: string; value: string; valueLabel: string }[]
  disabled?: boolean
  onChange?: (value: string) => void
}

const Select: FC<SelectProps> = ({
  id,
  name = id,
  value,
  values,
  disabled = false,
  onChange,
}) => (
  <div className={styles.select}>
    <select
      id={id}
      name={name}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      data-testid={`test-${id}-select`}>
      {values?.map(({ key, value, valueLabel }) => (
        <option key={key} value={value}>
          {valueLabel}
        </option>
      ))}
    </select>
    <FontAwesomeIcon icon={faChevronDown} color="black" />
  </div>
)

export default Select
