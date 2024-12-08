import React, { ChangeEvent, useEffect, useState } from 'react'

import { classNames, isValidNumber } from '../../utils/helpers.ts'

import styles from './TextField.module.scss'

export interface TextFieldProps {
  id: string
  name?: string
  type: 'text' | 'number'
  size?: 'normal' | 'small'
  placeholder?: string
  value?: string | number
  min?: number
  max?: number
  regex?: RegExp
  required?: boolean
  disabled?: boolean
  onChange?: (value?: string | number) => void
  onValid?: (valid: boolean) => void
}

const TextField: React.FC<TextFieldProps> = ({
  id,
  name,
  type,
  size = 'normal',
  placeholder,
  value,
  min,
  max,
  regex,
  required,
  disabled,
  onChange,
  onValid,
}) => {
  const [internalValue, setInternalValue] = useState<string | number>(
    value ?? '',
  )

  useEffect(() => {
    setInternalValue(value ?? '')
  }, [value])

  const [valid, setValid] = useState<boolean>(false)
  const [hasFocus, setHasFocus] = useState<boolean>(false)

  useEffect(() => {
    let tmpValid = true
    if (type === 'number') {
      if (
        typeof internalValue !== 'number' ||
        !isValidNumber(internalValue, min, max)
      ) {
        tmpValid = false
      }
    } else if (type === 'text') {
      if (typeof internalValue !== 'string') {
        tmpValid = false
      } else if (required && !internalValue) {
        tmpValid = false
      } else if (internalValue && regex && !regex.test(internalValue)) {
        tmpValid = false
      }
    }
    onValid?.(tmpValid)
    setValid(tmpValid)
  }, [internalValue, type, min, max, regex, required, onValid])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newValue: string | number = event.target.value
    if (type === 'number') {
      const parsedValue = parseInt(newValue, 10)
      newValue = isNaN(parsedValue) ? '' : parsedValue
    }
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div
      className={classNames(
        styles.main,
        size === 'small' ? styles.small : undefined,
        !valid && hasFocus ? styles.error : undefined,
      )}>
      <input
        id={id}
        name={name ?? id}
        type={type}
        value={internalValue}
        min={min}
        max={max}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleChange}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setHasFocus(false)}
        data-testid={`test-${id}-textfield`}
      />
    </div>
  )
}

export default TextField
