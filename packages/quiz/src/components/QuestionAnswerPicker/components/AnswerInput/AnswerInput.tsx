import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { QUESTION_TYPE_ANSWER_REGEX } from '@quiz/common'
import React, { FC, FormEvent, useCallback, useState } from 'react'

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
  const [valid, setValid] = useState<boolean>(true)

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      if (valid) {
        onSubmit(value)
      }
    },
    [onSubmit, valid, value],
  )

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
              regex={QUESTION_TYPE_ANSWER_REGEX}
              onChange={(newValue) => setValue(newValue as string)}
              onValid={setValid}
              required
            />
            <Button
              id="submit-button"
              type="submit"
              value="Submit"
              disabled={!valid}
            />
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
