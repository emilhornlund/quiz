import {
  calculateRangeBounds,
  calculateRangeStep,
  QuestionMultiChoiceDto,
  QuestionPinDto,
  QuestionPuzzleDto,
  QuestionRangeAnswerMargin,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionTypeAnswerDto,
  QuestionZeroToOneHundredRangeDto,
} from '@quiz/common'
import React, { FC, useMemo } from 'react'

import { isValidNumber } from '../../../../../../../../utils/helpers.ts'
import styles from '../../QuestionEditor.module.scss'
import QuestionField, { QuestionFieldType } from '../QuestionField'

export interface QuestionFormProps<T> {
  data: Partial<T>
  onChange: <K extends keyof T>(field: K, value?: T[K]) => void
  onValidChange: <K extends keyof T>(field: K, valid: boolean) => void
}

export const ClassicMultiChoiceOptionQuestionForm: FC<
  QuestionFormProps<QuestionMultiChoiceDto>
> = ({ data, onChange, onValidChange }) => {
  return (
    <>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonQuestion}
          value={data.question}
          onChange={(newValue) => onChange('question', newValue)}
          onValid={(valid) => onValidChange('question', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonMedia}
          value={data.media}
          duration={data.duration}
          onChange={(newValue) => onChange('media', newValue)}
          onValid={(valid) => onValidChange('media', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.MultiChoiceOptions}
          values={data.options}
          onChange={(newValue) => onChange('options', newValue)}
          onValid={(valid) => onValidChange('options', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonPoints}
          value={data.points}
          onChange={(newValue) => onChange('points', newValue)}
          onValid={(valid) => onValidChange('points', valid)}
        />
        <QuestionField
          type={QuestionFieldType.CommonDuration}
          value={data.duration}
          onChange={(newValue) => onChange('duration', newValue)}
          onValid={(valid) => onValidChange('duration', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonInfo}
          value={data.info}
          onChange={(newValue) => onChange('info', newValue)}
          onValid={(valid) => onValidChange('info', valid)}
        />
      </div>
    </>
  )
}

export const ClassicRangeQuestionForm: FC<
  QuestionFormProps<QuestionRangeDto>
> = ({ data, onChange, onValidChange }) => {
  const correctRangeMarginFooter = useMemo<string | undefined>(() => {
    const {
      correct = 0,
      margin = QuestionRangeAnswerMargin.Medium,
      min = 0,
      max = 100,
    } = data

    if (!isValidNumber(correct, min, max)) {
      return undefined
    }

    if (margin === QuestionRangeAnswerMargin.None) {
      return `The correct answer must be exactly ${correct}.`
    }

    if (margin === QuestionRangeAnswerMargin.Maximum) {
      return `All answers within the range ${min}–${max} will be accepted as correct.`
    }

    const { lower: lowerBound, upper: upperBound } = calculateRangeBounds(
      margin,
      correct,
      min,
      max,
      calculateRangeStep(min, max),
    )

    return `Answers between ${lowerBound} and ${upperBound} will be considered correct.`
  }, [data])

  return (
    <>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonQuestion}
          value={data.question}
          onChange={(newValue) => onChange('question', newValue)}
          onValid={(valid) => onValidChange('question', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonMedia}
          value={data.media}
          duration={data.duration}
          onChange={(newValue) => onChange('media', newValue)}
          onValid={(valid) => onValidChange('media', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.RangeMin}
          value={data.min}
          max={data.max}
          onChange={(newValue) => onChange('min', newValue)}
          onValid={(valid) => onValidChange('min', valid)}
        />
        <QuestionField
          type={QuestionFieldType.RangeMax}
          value={data.max}
          min={data.min}
          onChange={(newValue) => onChange('max', newValue)}
          onValid={(valid) => onValidChange('max', valid)}
        />
        <QuestionField
          type={QuestionFieldType.RangeCorrect}
          value={data.correct}
          min={data.min}
          max={data.max}
          onChange={(newValue) => onChange('correct', newValue)}
          onValid={(valid) => onValidChange('correct', valid)}
        />
        <QuestionField
          type={QuestionFieldType.RangeMargin}
          value={data.margin}
          footer={correctRangeMarginFooter}
          onChange={(newValue) => onChange('margin', newValue)}
          onValid={(valid) => onValidChange('margin', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonPoints}
          value={data.points}
          onChange={(newValue) => onChange('points', newValue)}
          onValid={(valid) => onValidChange('points', valid)}
        />
        <QuestionField
          type={QuestionFieldType.CommonDuration}
          value={data.duration}
          onChange={(newValue) => onChange('duration', newValue)}
          onValid={(valid) => onValidChange('duration', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonInfo}
          value={data.info}
          onChange={(newValue) => onChange('info', newValue)}
          onValid={(valid) => onValidChange('info', valid)}
        />
      </div>
    </>
  )
}

export const ClassicTrueFalseQuestionForm: FC<
  QuestionFormProps<QuestionTrueFalseDto>
> = ({ data, onChange, onValidChange }) => {
  return (
    <>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonQuestion}
          value={data.question}
          onChange={(newValue) => onChange('question', newValue)}
          onValid={(valid) => onValidChange('question', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonMedia}
          value={data.media}
          duration={data.duration}
          onChange={(newValue) => onChange('media', newValue)}
          onValid={(valid) => onValidChange('media', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.TrueFalseOptions}
          value={data.correct}
          onChange={(newValue) => onChange('correct', newValue)}
          onValid={(valid) => onValidChange('correct', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonPoints}
          value={data.points}
          onChange={(newValue) => onChange('points', newValue)}
          onValid={(valid) => onValidChange('points', valid)}
        />
        <QuestionField
          type={QuestionFieldType.CommonDuration}
          value={data.duration}
          onChange={(newValue) => onChange('duration', newValue)}
          onValid={(valid) => onValidChange('duration', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonInfo}
          value={data.info}
          onChange={(newValue) => onChange('info', newValue)}
          onValid={(valid) => onValidChange('info', valid)}
        />
      </div>
    </>
  )
}

export const ClassicTypeAnswerQuestionForm: FC<
  QuestionFormProps<QuestionTypeAnswerDto>
> = ({ data, onChange, onValidChange }) => {
  return (
    <>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonQuestion}
          value={data.question}
          onChange={(newValue) => onChange('question', newValue)}
          onValid={(valid) => onValidChange('question', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonMedia}
          value={data.media}
          duration={data.duration}
          onChange={(newValue) => onChange('media', newValue)}
          onValid={(valid) => onValidChange('media', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.TypeAnswerOptions}
          values={data.options}
          onChange={(newValue) => onChange('options', newValue)}
          onValid={(valid) => onValidChange('options', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonPoints}
          value={data.points}
          onChange={(newValue) => onChange('points', newValue)}
          onValid={(valid) => onValidChange('points', valid)}
        />
        <QuestionField
          type={QuestionFieldType.CommonDuration}
          value={data.duration}
          onChange={(newValue) => onChange('duration', newValue)}
          onValid={(valid) => onValidChange('duration', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonInfo}
          value={data.info}
          onChange={(newValue) => onChange('info', newValue)}
          onValid={(valid) => onValidChange('info', valid)}
        />
      </div>
    </>
  )
}

export const ClassicPinQuestionForm: FC<QuestionFormProps<QuestionPinDto>> = ({
  data,
  onChange,
  onValidChange,
}) => (
  <>
    <div className={styles.section}>
      <QuestionField
        type={QuestionFieldType.CommonQuestion}
        value={data.question}
        onChange={(newValue) => onChange('question', newValue)}
        onValid={(valid) => onValidChange('question', valid)}
      />
    </div>
    <div className={styles.section}>
      <QuestionField
        type={QuestionFieldType.Pin}
        imageURL={data.imageURL}
        position={{
          x: data?.positionX,
          y: data?.positionY,
        }}
        tolerance={data.tolerance}
        onImageUrlChange={(newValue) => onChange('imageURL', newValue)}
        onImageUrlValid={(newValid) => onValidChange('imageURL', newValid)}
        onPositionChange={(pos) => {
          onChange('positionX', pos?.x)
          onChange('positionY', pos?.y)
        }}
        onPositionValid={(valid) => {
          onValidChange('positionX', valid)
          onValidChange('positionY', valid)
        }}
      />
    </div>
    <div className={styles.section}>
      <QuestionField
        type={QuestionFieldType.PinTolerance}
        value={data.tolerance}
        onChange={(newValue) => onChange('tolerance', newValue)}
        onValid={(valid) => onValidChange('tolerance', valid)}
      />
    </div>
    <div className={styles.section}>
      <QuestionField
        type={QuestionFieldType.CommonPoints}
        value={data.points}
        onChange={(newValue) => onChange('points', newValue)}
        onValid={(valid) => onValidChange('points', valid)}
      />
      <QuestionField
        type={QuestionFieldType.CommonDuration}
        value={data.duration}
        onChange={(newValue) => onChange('duration', newValue)}
        onValid={(valid) => onValidChange('duration', valid)}
      />
    </div>
    <div className={styles.section}>
      <QuestionField
        type={QuestionFieldType.CommonInfo}
        value={data.info}
        onChange={(newValue) => onChange('info', newValue)}
        onValid={(valid) => onValidChange('info', valid)}
      />
    </div>
  </>
)

export const ClassicPuzzleQuestionForm: FC<
  QuestionFormProps<QuestionPuzzleDto>
> = ({ data, onChange, onValidChange }) => (
  <>
    <div className={styles.section}>
      <QuestionField
        type={QuestionFieldType.CommonQuestion}
        value={data.question}
        onChange={(newValue) => onChange('question', newValue)}
        onValid={(valid) => onValidChange('question', valid)}
      />
    </div>
    <div className={styles.section}>
      <QuestionField
        type={QuestionFieldType.CommonMedia}
        value={data.media}
        duration={data.duration}
        onChange={(newValue) => onChange('media', newValue)}
        onValid={(valid) => onValidChange('media', valid)}
      />
    </div>
    <div className={styles.section}>
      <QuestionField
        type={QuestionFieldType.PuzzleValues}
        value={data.values}
        onChange={(newValue) => onChange('values', newValue)}
        onValid={(valid) => onValidChange('values', valid)}
      />
    </div>
    <div className={styles.section}>
      <QuestionField
        type={QuestionFieldType.CommonPoints}
        value={data.points}
        onChange={(newValue) => onChange('points', newValue)}
        onValid={(valid) => onValidChange('points', valid)}
      />
      <QuestionField
        type={QuestionFieldType.CommonDuration}
        value={data.duration}
        onChange={(newValue) => onChange('duration', newValue)}
        onValid={(valid) => onValidChange('duration', valid)}
      />
    </div>
    <div className={styles.section}>
      <QuestionField
        type={QuestionFieldType.CommonInfo}
        value={data.info}
        onChange={(newValue) => onChange('info', newValue)}
        onValid={(valid) => onValidChange('info', valid)}
      />
    </div>
  </>
)

export const ZeroToOneHundredRangeQuestionForm: FC<
  QuestionFormProps<QuestionZeroToOneHundredRangeDto>
> = ({ data, onChange, onValidChange }) => {
  return (
    <>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonQuestion}
          value={data.question}
          onChange={(newValue) => onChange('question', newValue)}
          onValid={(valid) => onValidChange('question', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonMedia}
          value={data.media}
          duration={data.duration}
          onChange={(newValue) => onChange('media', newValue)}
          onValid={(valid) => onValidChange('media', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.RangeCorrect}
          value={data.correct}
          min={0}
          max={100}
          onChange={(newValue) => onChange('correct', newValue)}
          onValid={(valid) => onValidChange('correct', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonDuration}
          value={data.duration}
          onChange={(newValue) => onChange('duration', newValue)}
          onValid={(valid) => onValidChange('duration', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.CommonInfo}
          value={data.info}
          onChange={(newValue) => onChange('info', newValue)}
          onValid={(valid) => onValidChange('info', valid)}
        />
      </div>
    </>
  )
}
