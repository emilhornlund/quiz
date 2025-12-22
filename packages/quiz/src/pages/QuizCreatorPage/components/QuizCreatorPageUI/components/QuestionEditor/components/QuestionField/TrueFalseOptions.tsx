import React, { FC, useCallback, useEffect, useState } from 'react'

import { TextField } from '../../../../../../../../components'
import { QuizQuestionValidationResult } from '../../../../../../utils/QuestionDataSource'
import { getValidationErrorMessage } from '../../../../../../validation-rules'

import styles from './QuestionField.module.scss'

export interface TrueFalseOptionsProps {
  value?: boolean
  validation: QuizQuestionValidationResult
  onChange: (value?: boolean) => void
}

const TrueFalseOptions: FC<TrueFalseOptionsProps> = ({
  value,
  validation,
  onChange,
}) => {
  const [options, setOptions] = useState<
    { id: 'true' | 'false'; value: string; correct: boolean }[]
  >(() => [
    { id: 'true', value: 'True', correct: value === true },
    { id: 'false', value: 'False', correct: value === false },
  ])

  useEffect(() => {
    setOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        correct: opt.id === 'true' ? value === true : value === false,
      })),
    )
  }, [value])

  const handleChange = useCallback(
    (updatedIndex: number, checked: boolean) => {
      setOptions((prev) => {
        const next = prev.map((opt, i) =>
          i === updatedIndex
            ? { ...opt, correct: checked }
            : { ...opt, correct: checked ? false : opt.correct },
        )

        const picked = next.find((o) => o.correct)
        onChange(picked ? picked.id === 'true' : undefined)
        return next
      })
    },
    [onChange],
  )

  const handleAdditionalValidation = useCallback((): boolean | string => {
    const someCorrect = options.some((o) => o.correct)
    if (!someCorrect) return 'At least one option must be marked correct'
    return true
  }, [options])

  return (
    <div className={styles.optionsContainer}>
      {options.map((option, index) => (
        <div key={`true-false-option-${index}`} className={styles.option}>
          <div className={styles.content}>
            <TextField
              id={`true-false-option-${index}-textfield`}
              type="text"
              value={option.value}
              checked={option.correct}
              customErrorMessage={getValidationErrorMessage(
                validation,
                'correct',
              )}
              onCheck={(checked) => handleChange(index, checked)}
              onAdditionalValidation={() => handleAdditionalValidation()}
              forceValidate
              readOnly
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default TrueFalseOptions
