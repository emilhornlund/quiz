import { faRocket } from '@fortawesome/free-solid-svg-icons'
import React, { FC, useState } from 'react'

import Button from '../../../Button'
import { SortableTable, SortableTableValue } from '../../../index.ts'

import styles from './AnswerSort.module.scss'

export type AnswerSortProps = {
  values: string[]
  interactive: boolean
  onSubmit: (values: string[]) => void
}

const AnswerSort: FC<AnswerSortProps> = ({ values, interactive, onSubmit }) => {
  const [internalValues, setInternalValues] = useState<SortableTableValue[]>(
    () =>
      values.map((value, index) => ({
        id: `${value.replace(' ', '-')}_${index}`,
        value,
      })),
  )

  const handleSubmit = () =>
    onSubmit(internalValues.map((value) => value.value))

  return (
    <div className={styles.answerSort}>
      <div className={styles.table}>
        <SortableTable
          values={internalValues}
          disabled={!interactive}
          onChange={setInternalValues}
        />
      </div>

      {interactive && (
        <div className={styles.buttonWrapper}>
          <Button
            id="submit-button"
            type="button"
            kind="call-to-action"
            icon={faRocket}
            onClick={handleSubmit}>
            Submit My Answer
          </Button>
        </div>
      )}
    </div>
  )
}

export default AnswerSort
