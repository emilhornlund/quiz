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
    <span>{count}</span>
  </div>
)

export interface QuestionResultsProps {
  results: GameEventQuestionResults
}

const QuestionResults: FC<QuestionResultsProps> = ({ results }) => (
  <div className={styles.questionResults}>
    <div className={styles.chips}>
      {results.type === QuestionType.MultiChoice &&
        results.distribution.map(({ value, count, correct }, index) => (
          <ResultChip
            key={`${index}_${value}`}
            value={value}
            count={count}
            correct={correct}
          />
        ))}

      {results.type === QuestionType.TrueFalse &&
        results.distribution.map(({ value, count, correct }, index) => (
          <ResultChip
            key={`${index}_${value}`}
            value={value ? 'True' : 'False'}
            count={count}
            correct={correct}
          />
        ))}

      {results.type === QuestionType.Range &&
        results.distribution.map(({ value, count, correct }, index) => (
          <ResultChip
            key={`${index}_${value}`}
            value={`${value}`}
            count={count}
            correct={correct}
          />
        ))}

      {results.type === QuestionType.TypeAnswer &&
        results.distribution.map(({ value, count, correct }, index) => (
          <ResultChip
            key={`${index}_${value}`}
            value={value}
            count={count}
            correct={correct}
          />
        ))}
    </div>
  </div>
)

export default QuestionResults
