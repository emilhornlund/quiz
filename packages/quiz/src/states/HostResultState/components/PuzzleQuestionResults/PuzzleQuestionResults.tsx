import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GameEventQuestionResultsPuzzle } from '@quiz/common'
import React, { FC, useMemo } from 'react'

import { SortableTable } from '../../../../components'
import colors from '../../../../styles/colors.module.scss'
import { classNames } from '../../../../utils/helpers.ts'

import styles from './PuzzleQuestionResults.module.scss'

const calculatePercentage = (value: number, total: number) => {
  if (total === 0) return '0%'
  const percentage = Math.min(100 - (value / total) * 100, 80)
  return `${percentage}%`
}

export type PuzzleQuestionResultsProps = {
  results: GameEventQuestionResultsPuzzle
}

const PuzzleQuestionResults: FC<PuzzleQuestionResultsProps> = ({ results }) => {
  const { correct, incorrect, total } = useMemo(() => {
    return results.distribution.reduce(
      (prev, curr) => ({
        correct: curr.correct ? prev.correct + curr.count : prev.correct,
        incorrect: !curr.correct ? prev.incorrect + curr.count : prev.incorrect,
        total: prev.total + curr.count,
      }),
      { correct: 0, incorrect: 0, total: 0 },
    )
  }, [results])

  const correctFlexBasisPercentage = useMemo(
    () => calculatePercentage(correct, total),
    [correct, total],
  )

  const incorrectFlexBasisPercentage = useMemo(
    () => calculatePercentage(incorrect, total),
    [incorrect, total],
  )

  return (
    <div className={styles.puzzleQuestionResults}>
      <div className={styles.bars}>
        <div className={styles.bar}>
          <div
            className={styles.spacer}
            style={{
              flexBasis: correctFlexBasisPercentage,
            }}
          />
          <div className={classNames(styles.inner, styles.green)}>
            <div className={styles.spacer} />
            <div className={styles.footer}>
              <div>{correct}</div>
              <div>
                <FontAwesomeIcon icon={faCheck} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.bar}>
          <div
            className={styles.spacer}
            style={{
              flexBasis: incorrectFlexBasisPercentage,
            }}
          />
          <div className={classNames(styles.inner, styles.red)}>
            <div className={styles.spacer} />
            <div className={styles.footer}>
              <div>{incorrect}</div>
              <div>
                <FontAwesomeIcon icon={faXmark} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.puzzle}>
        <SortableTable
          values={results.values.map((value, index) => ({
            id: `${value.replace(' ', '-')}_${index}`,
            value,
            icon: faCheck,
            iconColor: colors.green2,
          }))}
          disabled
        />
      </div>
    </div>
  )
}

export default PuzzleQuestionResults
