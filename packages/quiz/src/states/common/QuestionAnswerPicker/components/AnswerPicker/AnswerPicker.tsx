import React, { FC } from 'react'

import styles from './AnswerPicker.module.scss'

export interface AnswerPickerProps {
  answers: string[]
  interactive: boolean
  onClick: (optionIndex: number) => void
}

const AnswerPicker: FC<AnswerPickerProps> = ({
  answers,
  interactive,
  onClick,
}) => (
  <div className={styles.answerPicker}>
    <div className={styles.grid}>
      {answers.map((value, optionIndex) => (
        <button
          key={`${optionIndex}_${value}`}
          id={`${optionIndex}_${value}`}
          type="button"
          className={styles.item}
          disabled={!interactive}
          onClick={() => onClick(optionIndex)}>
          <div />
          {value}
        </button>
      ))}
    </div>
  </div>
)

export default AnswerPicker
