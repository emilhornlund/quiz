import React, { ChangeEvent, FC, useEffect, useState } from 'react'

import { classNames } from '../../utils/helpers.ts'

import styles from './Textarea.module.scss'

export interface TextareaProps {
  id: string
  name?: string
  value?: string
  placeholder?: string
  regex?: RegExp
  required?: boolean
  disabled?: boolean
  onChange?: (value: string) => void
  onValid?: (valid: boolean) => void
}

const Textarea: FC<TextareaProps> = ({
  id,
  name = id,
  value,
  placeholder,
  regex,
  required,
  disabled = false,
  onChange,
  onValid,
}) => {
  const [internalValue, setInternalValue] = useState<string>(value ?? '')

  useEffect(() => {
    setInternalValue(value ?? '')
  }, [value])

  const [valid, setValid] = useState<boolean>(false)
  const [hasFocus, setHasFocus] = useState<boolean>(false)

  useEffect(() => {
    let tmpValid = true
    if (required && !internalValue) {
      tmpValid = false
    } else if (internalValue && regex && !regex.test(internalValue)) {
      tmpValid = false
    }
    onValid?.(tmpValid)
    setValid(tmpValid)
  }, [internalValue, regex, required, onValid])

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div
      className={classNames(
        styles.container,
        !valid && hasFocus ? styles.error : undefined,
      )}>
      <textarea
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleChange}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setHasFocus(false)}
        data-testid={`test-${id}-textarea`}
      />
    </div>
  )
}

export default Textarea
