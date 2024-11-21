import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { ChangeEvent, FC, FormEvent, useCallback, useState } from 'react'

import { isValidNumber } from '../../../../utils/helpers.ts'
import Button from '../../../Button'
import TextField from '../../../TextField'

import styles from './AnswerRange.module.scss'

export interface AnswerRangeProps {
  min: number
  max: number
  step: number
  interactive: boolean
  onSubmit: (value: number) => void
}

const AnswerRange: FC<AnswerRangeProps> = ({
  min,
  max,
  step,
  interactive = true,
  onSubmit,
}) => {
  const [value, setValue] = useState<number>(Math.floor(min + (max - min) / 2))
  const [valid, setValid] = useState<boolean>(true)

  const handleSliderChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(event.target.value, 10)
      setValue(newValue)
      setValid(isValidNumber(newValue, min, max))
    },
    [min, max],
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

  return (
    <div className={styles.main}>
      {interactive ? (
        <div className={styles.interactive}>
          <form onSubmit={handleSubmit}>
            <input
              id="slider-range"
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={handleSliderChange}
            />
            <div className={styles.inputGroup}>
              <TextField
                id="slider-input"
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={(newValue) => setValue(newValue as number)}
                onValid={setValid}
                required
              />
              <Button
                id="submit-button"
                type="submit"
                value="Submit"
                disabled={!valid}
              />
            </div>
          </form>
        </div>
      ) : (
        <div className={styles.nonInteractive}>
          <FontAwesomeIcon icon={faCircleInfo} />
          <span>
            Pick an answer between {min} and {max} on your screen
          </span>
        </div>
      )}
    </div>
  )
}

export default AnswerRange
