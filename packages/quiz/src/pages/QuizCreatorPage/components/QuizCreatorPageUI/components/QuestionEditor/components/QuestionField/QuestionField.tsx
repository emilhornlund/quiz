import {
  MediaType,
  QuestionMediaDto,
  QuestionMultiChoiceOptionDto,
  QuestionRangeAnswerMargin,
  QuestionType,
  QUIZ_QUESTION_TEXT_MAX_LENGTH,
  QUIZ_QUESTION_TEXT_MIN_LENGTH,
  QUIZ_QUESTION_TEXT_REGEX,
  URL_REGEX,
} from '@quiz/common'
import React, { FC, ReactNode } from 'react'

import { Select, TextField } from '../../../../../../../../components'
import {
  MediaTypeLabels,
  QuestionRangeAnswerMarginLabels,
  QuestionTypeLabels,
} from '../../../../../../../../models/labels.ts'
import { classNames } from '../../../../../../../../utils/helpers.ts'

import MultiChoiceOptions from './MultiChoiceOptions.tsx'
import styles from './QuestionField.module.scss'
import TrueFalseOptions from './TrueFalseOptions.tsx'
import TypeAnswerOptions from './TypeAnswerOptions.tsx'
import { QuestionFieldType } from './types.ts'

export type QuestionFieldProps =
  | {
      type: QuestionFieldType.CommonDuration
      value?: number
      onChange: (value: number) => void
      onValid: (valid: boolean) => void
    }
  | {
      type: QuestionFieldType.CommonMedia
      value?: QuestionMediaDto
      onChange: (value?: QuestionMediaDto) => void
      onValid: (valid: boolean) => void
    }
  | {
      type: QuestionFieldType.CommonPoints
      value?: number
      onChange: (value: number) => void
      onValid: (valid: boolean) => void
    }
  | {
      type: QuestionFieldType.CommonQuestion
      value?: string
      onChange: (value: string) => void
      onValid: (valid: boolean) => void
    }
  | {
      type: QuestionFieldType.CommonType
      value?: QuestionType
      onChange: (value: QuestionType) => void
      onValid: (valid: boolean) => void
    }
  | {
      type: QuestionFieldType.MultiChoiceOptions
      values?: QuestionMultiChoiceOptionDto[]
      onChange: (value: QuestionMultiChoiceOptionDto[]) => void
      onValid: (valid: boolean) => void
    }
  | {
      type: QuestionFieldType.RangeCorrect
      value?: number
      min?: number
      max?: number
      onChange: (value: number) => void
      onValid: (valid: boolean) => void
    }
  | {
      type: QuestionFieldType.RangeMargin
      value?: QuestionRangeAnswerMargin
      onChange: (value: QuestionRangeAnswerMargin) => void
      onValid: (valid: boolean) => void
    }
  | {
      type: QuestionFieldType.RangeMax
      value?: number
      onChange: (value: number) => void
      onValid: (valid: boolean) => void
    }
  | {
      type: QuestionFieldType.RangeMin
      value?: number
      onChange: (value: number) => void
      onValid: (valid: boolean) => void
    }
  | {
      type: QuestionFieldType.TrueFalseOptions
      value?: boolean
      onChange: (value?: boolean) => void
      onValid: (valid: boolean) => void
    }
  | {
      type: QuestionFieldType.TypeAnswerOptions
      values?: string[]
      onChange: (values?: string[]) => void
      onValid: (valid: boolean) => void
    }

const QuestionFieldWrapper: FC<{
  label: string
  layout?: 'full' | 'half'
  className?: string
  children: ReactNode
}> = ({ label, layout = 'full', className, children }) => (
  <div
    className={classNames(
      styles.questionFieldContainer,
      {
        full: styles.layoutFull,
        half: styles.layoutHalf,
        'half-exclusive': styles.layoutHalfExclusive,
      }[layout],
    )}>
    <div className={styles.label}>{label}</div>
    <div className={classNames(styles.content, className)}>{children}</div>
  </div>
)

const QuestionField: FC<QuestionFieldProps> = (props) => {
  switch (props.type) {
    case QuestionFieldType.CommonDuration:
      return (
        <QuestionFieldWrapper label="Time Limit" layout="half">
          <Select
            id="duration-select"
            value={props.value !== undefined ? `${props.value}` : '30'}
            values={[
              {
                key: '5',
                value: '5',
                valueLabel: '5 seconds',
              },
              {
                key: '30',
                value: '30',
                valueLabel: '30 seconds',
              },
              {
                key: '60',
                value: '60',
                valueLabel: '1 minute',
              },
              {
                key: '120',
                value: '120',
                valueLabel: '2 minutes',
              },
            ]}
            onChange={(value) => props.onChange(parseInt(value))}
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.CommonMedia:
      return (
        <>
          <QuestionFieldWrapper label="Media Type" layout="half">
            <Select
              id="media-type-select"
              value={props.value?.type ?? 'none'}
              values={[
                { key: 'none', value: 'none', valueLabel: 'None' },
                ...Object.values(MediaType).map((type) => ({
                  key: type,
                  value: type,
                  valueLabel: MediaTypeLabels[type],
                })),
              ]}
              onChange={(value) =>
                props.onChange(
                  value === 'none'
                    ? undefined
                    : { type: value as MediaType, url: props.value?.url || '' },
                )
              }
            />
          </QuestionFieldWrapper>
          <QuestionFieldWrapper label="Media URL" layout="half">
            <TextField
              id="media-url-textfield"
              type="text"
              placeholder="URL"
              value={props.value?.url}
              regex={{ value: URL_REGEX, message: 'Is not a valid URL' }}
              required={!!props.value?.type && 'Media URL is required'}
              disabled={!props.value?.type}
              onChange={(value) =>
                props.onChange(
                  props.value?.type
                    ? { type: props.value.type, url: value as string }
                    : undefined,
                )
              }
            />
          </QuestionFieldWrapper>
        </>
      )
    case QuestionFieldType.CommonPoints:
      return (
        <QuestionFieldWrapper label="Points" layout="half">
          <Select
            id="points-select"
            value={props.value !== undefined ? `${props.value}` : '1000'}
            values={[
              {
                key: '0',
                value: '0',
                valueLabel: 'Zero Points',
              },
              {
                key: '1000',
                value: '1000',
                valueLabel: 'Standard Points (1000)',
              },
              {
                key: '2000',
                value: '2000',
                valueLabel: 'Double Points (2000)',
              },
            ]}
            onChange={(value) => props.onChange(parseInt(value))}
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.CommonQuestion:
      return (
        <QuestionFieldWrapper label="Question" layout="full">
          <TextField
            id="question-text-textfield"
            type="text"
            placeholder="Question"
            value={props.value}
            minLength={QUIZ_QUESTION_TEXT_MIN_LENGTH}
            maxLength={QUIZ_QUESTION_TEXT_MAX_LENGTH}
            regex={QUIZ_QUESTION_TEXT_REGEX}
            required={true}
            onChange={(value) => props.onChange(value as string)}
            forceValidate
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.CommonType:
      return (
        <QuestionFieldWrapper label="Type" layout="half">
          <Select
            id="question-type-select"
            value={props.value}
            values={Object.values(QuestionType).map((type) => ({
              key: type,
              value: type,
              valueLabel: QuestionTypeLabels[type],
            }))}
            onChange={(value) => props.onChange(value as QuestionType)}
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.MultiChoiceOptions:
      return (
        <QuestionFieldWrapper label="Options" layout="full">
          <MultiChoiceOptions {...props} />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.RangeCorrect:
      return (
        <QuestionFieldWrapper label="Correct" layout="half">
          <TextField
            id="range-correct-textfield"
            type="number"
            placeholder=""
            value={props.value}
            min={props.min}
            max={props.max}
            onChange={(value) => props.onChange(value as number)}
            required
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.RangeMargin:
      return (
        <QuestionFieldWrapper label="Margin" layout="half">
          <Select
            id="range-margin-select"
            value={props.value}
            values={Object.values(QuestionRangeAnswerMargin).map((type) => ({
              key: type,
              value: type,
              valueLabel: QuestionRangeAnswerMarginLabels[type],
            }))}
            onChange={(value) =>
              props.onChange(value as QuestionRangeAnswerMargin)
            }
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.RangeMax:
      return (
        <QuestionFieldWrapper label="Max" layout="half">
          <TextField
            id="range-max-textfield"
            type="number"
            placeholder=""
            value={props.value}
            onChange={(value) => props.onChange(value as number)}
            required
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.RangeMin:
      return (
        <QuestionFieldWrapper label="Min" layout="half">
          <TextField
            id="range-min-textfield"
            type="number"
            placeholder=""
            value={props.value}
            onChange={(value) => props.onChange(value as number)}
            required
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.TrueFalseOptions:
      return (
        <QuestionFieldWrapper
          label="Options"
          layout="full"
          className={styles.optionsContainer}>
          <TrueFalseOptions {...props} />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.TypeAnswerOptions:
      return (
        <QuestionFieldWrapper
          label="Options"
          layout="full"
          className={styles.optionsContainer}>
          <TypeAnswerOptions {...props} />
        </QuestionFieldWrapper>
      )
  }
}

export default QuestionField
