import React, { ChangeEvent } from 'react'

import styles from './TextField.module.scss'

export interface TextFieldProps {
  id: string
  name?: string
  type: 'text' | 'number'
  placeholder?: string
  value?: string | number
  min?: number
  max?: number
  disabled?: boolean
  onChange?: (value: string) => void
}

const TextField: React.FC<TextFieldProps> = ({
  id,
  name,
  type,
  value,
  min,
  max,
  placeholder,
  disabled,
  onChange,
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    let valid = true
    if (type == 'number') {
      const value = parseInt(event.target.value, 10)
      if (Number.isNaN(value)) {
        valid = false
      } else if (
        (min !== undefined && !Number.isNaN(min) && value < min) ||
        (max !== undefined && !Number.isNaN(max) && value > max)
      ) {
        valid = false
      }
    }
    if (valid) {
      onChange?.(event.target.value)
    }
  }

  return (
    <div className={styles.main}>
      <input
        id={id}
        name={name ?? id}
        type={type}
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleChange}
        data-testid={`test-${id}-textfield`}
      />
    </div>
  )
}

export default TextField
