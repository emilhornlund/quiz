import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC, FormEvent, useState } from 'react'

import Button from '../../../Button'
import { TextField } from '../../../index.ts'

import styles from './AnswerSlider.module.scss'

export interface AnswerSliderProps {
  min: number
  max: number
  step: number
  interactive: boolean
  onSubmit: (value: number) => void
}

const AnswerSlider: FC<AnswerSliderProps> = ({
  min,
  max,
  step,
  interactive = true,
  onSubmit,
}) => {
  const [value, setValue] = useState<number>(min)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit(value)
  }

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
              onChange={(e) => setValue(parseInt(e.target.value, 10))}
            />
            <div className={styles.inputGroup}>
              <TextField
                id="slider-input"
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={(newValue) => setValue(parseInt(newValue, 10))}
              />
              <Button id="submit-button" type="submit" value="Submit" />
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

export default AnswerSlider
