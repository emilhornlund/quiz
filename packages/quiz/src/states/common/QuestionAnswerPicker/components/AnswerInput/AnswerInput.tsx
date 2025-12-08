import {
  GameQuestionPlayerAnswerEvent,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX_LENGTH,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN_LENGTH,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX,
} from '@quiz/common'
import React, {
  FC,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Button, TextField } from '../../../../../components'
import NonInteractiveInfoBox from '../../../NonInteractiveInfoBox'

import styles from './AnswerInput.module.scss'

export interface AnswerInputProps {
  submittedAnswer?: GameQuestionPlayerAnswerEvent
  interactive: boolean
  loading: boolean
  onSubmit: (value: string) => void
}

const AnswerInput: FC<AnswerInputProps> = ({
  submittedAnswer,
  interactive,
  loading,
  onSubmit,
}) => {
  const [value, setValue] = useState('')
  const [valid, setValid] = useState<boolean>(true)
  const formRef = useRef<HTMLFormElement>(null)

  const disabled = useMemo(
    () => !interactive || loading || !!submittedAnswer,
    [interactive, loading, submittedAnswer],
  )

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      if (valid) {
        onSubmit(value)
      }
    },
    [onSubmit, valid, value],
  )

  // Handle Enter key submission for better UX
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter' && valid && value.trim()) {
        event.preventDefault()
        onSubmit(value)
      }
    },
    [onSubmit, valid, value],
  )

  useEffect(() => {
    const form = formRef.current
    if (form && interactive) {
      form.addEventListener('keydown', handleKeyDown)
      return () => {
        form.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [handleKeyDown, interactive])

  if (!interactive && !submittedAnswer) {
    return (
      <div className={styles.answerInput}>
        <div style={{ display: 'flex', flex: 1 }} />
        <NonInteractiveInfoBox info="Type an answer on your screen" />
      </div>
    )
  }

  return (
    <div className={styles.answerInput}>
      <div className={styles.interactive}>
        <form ref={formRef} onSubmit={handleSubmit}>
          <TextField
            id="answer-input"
            type="text"
            placeholder="Answer"
            value={value}
            regex={QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX}
            minLength={QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN_LENGTH}
            maxLength={QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX_LENGTH}
            onChange={(newValue) => setValue(newValue as string)}
            onValid={setValid}
            disabled={disabled}
            required
            autoFocus
          />
          <Button
            id="submit-button"
            type="submit"
            value="Submit"
            disabled={disabled || !valid}
          />
        </form>
      </div>
    </div>
  )
}

export default AnswerInput
