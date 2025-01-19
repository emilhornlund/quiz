import { faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GameEventQuestionResults, QuestionType } from '@quiz/common'
import React, { FC } from 'react'

import { classNames } from '../../utils/helpers.ts'

import styles from './QuestionResults.module.scss'

interface ResultChipProps {
  value: string
  count: number
  correct: boolean
}

const ResultChip: FC<ResultChipProps> = ({ value, count, correct }) => (
  <div
    className={classNames(
      styles.chip,
      correct ? styles.correct : styles.incorrect,
    )}>
    {value}
    <span>
      <FontAwesomeIcon icon={faUserGroup} /> {count}
    </span>
  </div>
)

export interface QuestionResultsProps {
  results: GameEventQuestionResults
}

const getResultChips = (results: GameEventQuestionResults, correct: boolean) =>
  results.distribution
    .filter((item) => item.correct === correct)
    .sort((lhs, rhs) => rhs.count - lhs.count)
    .map(({ value, count, correct }, index) => {
      switch (results.type) {
        case QuestionType.MultiChoice:
          return (
            <ResultChip
              key={`${index}_${value}`}
              value={value as string}
              count={count}
              correct={correct}
            />
          )
        case QuestionType.TrueFalse:
          return (
            <ResultChip
              key={`${index}_${value}`}
              value={(value as boolean) ? 'True' : 'False'}
              count={count}
              correct={correct}
            />
          )
        case QuestionType.Range:
          return (
            <ResultChip
              key={`${index}_${value}`}
              value={`${value as number}`}
              count={count}
              correct={correct}
            />
          )
        case QuestionType.TypeAnswer:
          return (
            <ResultChip
              key={`${index}_${value}`}
              value={value as string}
              count={count}
              correct={correct}
            />
          )
      }
    })

const QuestionResults: FC<QuestionResultsProps> = ({ results }) => (
  <div className={styles.questionResults}>
    <div className={styles.chips}>{getResultChips(results, true)}</div>
    <div className={styles.chips}>{getResultChips(results, false)}</div>
  </div>
)

export default QuestionResults
