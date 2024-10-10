import React, { FC } from 'react'

import styles from './AnswerPicker.module.scss'

export interface AnswerPickerProps {
  answers: string[]
  interactive: boolean
  onClick: (index: number) => void
}

const AnswerPicker: FC<AnswerPickerProps> = ({ answers, interactive }) => (
  <div className={styles.main}>
    <div className={styles.grid}>
      {answers.map((value, index) => (
        <button
          key={`${index}_${value}`}
          id={`${index}_${value}`}
          type="button"
          className={styles.item}
          disabled={!interactive}
          onClick={() => undefined}>
          <div />
          {value}
        </button>
      ))}
    </div>
  </div>
)

export default AnswerPicker
