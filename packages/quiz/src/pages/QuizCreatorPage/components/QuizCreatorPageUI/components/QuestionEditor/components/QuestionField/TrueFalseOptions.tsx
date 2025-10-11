import React, { FC, useCallback, useEffect, useRef, useState } from 'react'

import { TextField } from '../../../../../../../../components'

import styles from './QuestionField.module.scss'

export interface TrueFalseOptionsProps {
  value?: boolean
  onChange: (value?: boolean) => void
  onValid: (valid: boolean) => void
}

const TrueFalseOptions: FC<TrueFalseOptionsProps> = ({
  value,
  onChange,
  onValid,
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

  const [validById, setValidById] = useState<Record<string, boolean>>({})

  const handleValidChange = useCallback((id: string, valid: boolean) => {
    setValidById((prev) =>
      prev[id] === valid ? prev : { ...prev, [id]: valid },
    )
  }, [])

  const wasAllValid = useRef<boolean | undefined>(undefined)
  useEffect(() => {
    const isAllValid = options.every((o) => !!validById[o.id])
    if (wasAllValid.current !== isAllValid) {
      wasAllValid.current = isAllValid
      onValid(isAllValid)
    }
  }, [options, validById, onValid])

  // optional housekeeping if you ever change options shape dynamically:
  useEffect(() => {
    const allowed = new Set(options.map((o) => o.id))
    setValidById((prev) => {
      let changed = false
      const next: Record<string, boolean> = {}
      for (const k of Object.keys(prev)) {
        if (allowed.has(k as 'true' | 'false')) next[k] = prev[k]
        else changed = true
      }
      return changed ? next : prev
    })
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
              onCheck={(checked) => handleChange(index, checked)}
              onValid={(ok) => handleValidChange(option.id, ok)}
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
