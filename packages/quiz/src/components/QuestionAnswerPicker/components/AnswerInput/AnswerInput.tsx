import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC, FormEvent, useState } from 'react'

import Button from '../../../Button'
import TextField from '../../../TextField'

import styles from './AnswerInput.module.scss'

export interface AnswerInputProps {
  interactive?: boolean
  onSubmit: (value: string) => void
}

const AnswerInput: FC<AnswerInputProps> = ({
  interactive = true,
  onSubmit,
}) => {
  const [value, setValue] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(value)
  }

  return (
    <div className={styles.main}>
      {interactive ? (
        <div className={styles.interactive}>
          <form onSubmit={handleSubmit}>
            <TextField
              id="answer-input"
              type="text"
              placeholder="Answer"
              value={value}
              onChange={(newValue) => setValue(newValue)}
            />
            <Button id="submit-button" type="submit" value="Submit" />
          </form>
        </div>
      ) : (
        <div className={styles.nonInteractive}>
          <FontAwesomeIcon icon={faCircleInfo} />
          <span>Type an answer on your screen</span>
        </div>
      )}
    </div>
  )
}

export default AnswerInput
