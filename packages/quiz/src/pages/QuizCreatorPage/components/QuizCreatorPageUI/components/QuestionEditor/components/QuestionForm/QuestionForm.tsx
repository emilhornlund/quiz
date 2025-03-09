import {
  QuestionMultiChoiceDto,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionTypeAnswerDto,
  QuestionZeroToOneHundredRangeDto,
} from '@quiz/common'
import React, { FC } from 'react'

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
    </>
  )
}

export const ClassicRangeQuestionForm: FC<
  QuestionFormProps<QuestionRangeDto>
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
          onChange={(newValue) => onChange('media', newValue)}
          onValid={(valid) => onValidChange('media', valid)}
        />
      </div>
      <div className={styles.section}>
        <QuestionField
          type={QuestionFieldType.RangeMin}
          value={data.min}
          onChange={(newValue) => onChange('min', newValue)}
          onValid={(valid) => onValidChange('min', valid)}
        />
        <QuestionField
          type={QuestionFieldType.RangeMax}
          value={data.max}
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
    </>
  )
}

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
    </>
  )
}
