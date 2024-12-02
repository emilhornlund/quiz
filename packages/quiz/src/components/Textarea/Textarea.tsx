import React, { FC } from 'react'

import styles from './Textarea.module.scss'

export interface TextareaProps {
  id: string
  name?: string
  value?: string
  placeholder?: string
  disabled?: boolean
  onChange?: (value: string) => void
}

const Textarea: FC<TextareaProps> = ({
  id,
  name = id,
  value,
  placeholder,
  disabled = false,
  onChange,
}) => {
  return (
    <div className={styles.container}>
      <textarea
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        data-testid={`test-${id}-textarea`}
      />
    </div>
  )
}

export default Textarea
