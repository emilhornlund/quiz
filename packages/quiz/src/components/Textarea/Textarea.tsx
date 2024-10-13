import React, { FC } from 'react'

import styles from './Textarea.module.scss'

export interface TextareaProps {
  id: string
  name?: string
  value?: string
  onChange?: (value: string) => void
}

const Textarea: FC<TextareaProps> = ({ id, name = id, value, onChange }) => {
  return (
    <div className={styles.container}>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        data-testid={`test-${id}-textarea`}
      />
    </div>
  )
}

export default Textarea
