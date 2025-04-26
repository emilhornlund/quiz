import {
  faCircleCheck,
  faCircleXmark,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  GameEventQuestionResults,
  GameEventQuestionResultsMultiChoice,
  QuestionCorrectAnswerDto,
  QuestionType,
} from '@quiz/common'
import React, { FC, useMemo } from 'react'

import { classNames } from '../../utils/helpers.ts'

import styles from './QuestionResults.module.scss'

interface ResultChipProps {
  value: string
  count: number
  correct: boolean
  loading?: boolean
  onClick?: () => void
}

const ResultChip: FC<ResultChipProps> = ({
  value,
  count,
  correct,
  loading,
  onClick,
}) => (
  <div
    className={classNames(
      styles.chip,
      correct ? styles.correct : styles.incorrect,
    )}>
    {value}
    <span>
      <FontAwesomeIcon icon={faUserGroup} /> {count}
    </span>
    <button
      className={classNames(
        styles.buttonOverlay,
        loading ? styles.loading : undefined,
      )}
      disabled={loading}
      onClick={onClick}>
      {!loading && !correct && (
        <FontAwesomeIcon icon={faCircleCheck} className={styles.icon} />
      )}
      {!loading && correct && (
        <FontAwesomeIcon icon={faCircleXmark} className={styles.icon} />
      )}
      {loading && (
        <div className={styles.loadingSpinner}>
          <div></div>
          <div></div>
          <div></div>
        </div>
      )}
    </button>
  </div>
)

export interface QuestionResultsProps {
  results: GameEventQuestionResults
  loading: boolean
  onAddCorrectAnswer: (answer: QuestionCorrectAnswerDto) => void
  onDeleteCorrectAnswer: (answer: QuestionCorrectAnswerDto) => void
}

const getResultChips = (
  results: GameEventQuestionResults,
  correct: boolean,
  loading: boolean,
  processCorrectAnswer: (answer: QuestionCorrectAnswerDto) => void,
) =>
  results.distribution
    .filter((item) => item.correct === correct)
    .sort((lhs, rhs) => rhs.count - lhs.count)
    .map((distribution, index) => {
      const { value, count, correct } = distribution
      switch (results.type) {
        case QuestionType.MultiChoice: {
          const optionIndex = (
            distribution as GameEventQuestionResultsMultiChoice['distribution'][0]
          ).index
          return (
            <ResultChip
              key={`${index}_${value}`}
              value={value as string}
              count={count}
              correct={correct}
              loading={loading}
              onClick={() =>
                processCorrectAnswer({
                  type: QuestionType.MultiChoice,
                  index: optionIndex,
                })
              }
            />
          )
        }
        case QuestionType.TrueFalse:
          return (
            <ResultChip
              key={`${index}_${value}`}
              value={(value as boolean) ? 'True' : 'False'}
              count={count}
              correct={correct}
              loading={loading}
              onClick={() =>
                processCorrectAnswer({
                  type: QuestionType.TrueFalse,
                  value: value as boolean,
                })
              }
            />
          )
        case QuestionType.Range:
          return (
            <ResultChip
              key={`${index}_${value}`}
              value={`${value as number}`}
              count={count}
              correct={correct}
              loading={loading}
              onClick={() =>
                processCorrectAnswer({
                  type: QuestionType.Range,
                  value: value as number,
                })
              }
            />
          )
        case QuestionType.TypeAnswer:
          return (
            <ResultChip
              key={`${index}_${value}`}
              value={value as string}
              count={count}
              correct={correct}
              loading={loading}
              onClick={() =>
                processCorrectAnswer({
                  type: QuestionType.TypeAnswer,
                  value: value as string,
                })
              }
            />
          )
      }
    })

const QuestionResults: FC<QuestionResultsProps> = ({
  results,
  loading,
  onAddCorrectAnswer,
  onDeleteCorrectAnswer,
}) => {
  const correctElements = useMemo(
    () => getResultChips(results, true, loading, onDeleteCorrectAnswer),
    [results, loading, onDeleteCorrectAnswer],
  )
  const incorrectElements = useMemo(
    () => getResultChips(results, false, loading, onAddCorrectAnswer),
    [results, loading, onAddCorrectAnswer],
  )
  return (
    <div className={styles.questionResults}>
      <div className={styles.chips}>{correctElements}</div>
      <div className={styles.chips}>{incorrectElements}</div>
    </div>
  )
}

export default QuestionResults
