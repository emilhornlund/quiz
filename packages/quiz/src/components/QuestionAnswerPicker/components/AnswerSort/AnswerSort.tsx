import React, { FC } from 'react'

import styles from './AnswerSort.module.scss'

export type AnswerSortProps = {
  values: string[]
  interactive: boolean
  onClick: (optionIndex: number) => void
}

const AnswerSort: FC<AnswerSortProps> = ({ values, interactive, onClick }) => (
  <div className={styles.main}>
    <div className={styles.grid}>
      {values.map((value) => (
        <div key={value}>{value}</div>
      ))}
    </div>
  </div>
)

export default AnswerSort
