import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import {
  QuestionMediaDto,
  QuestionMultiChoiceOptionDto,
  QuestionRangeAnswerMargin,
  QuestionType,
  QUIZ_QUESTION_TEXT_MAX_LENGTH,
  QUIZ_QUESTION_TEXT_MIN_LENGTH,
  QUIZ_QUESTION_TEXT_REGEX,
} from '@quiz/common'
import React, { FC, ReactNode } from 'react'

import { Select, TextField } from '../../../../../../../../components'
import IconTooltip from '../../../../../../../../components/IconTooltip'
import {
  QuestionRangeAnswerMarginLabels,
  QuestionTypeLabels,
} from '../../../../../../../../models'
import { classNames } from '../../../../../../../../utils/helpers.ts'

import MediaQuestionField from './MediaQuestionField'
import MultiChoiceOptions from './MultiChoiceOptions.tsx'
import styles from './QuestionField.module.scss'
import TrueFalseOptions from './TrueFalseOptions.tsx'
import TypeAnswerOptions from './TypeAnswerOptions.tsx'
import { QuestionFieldType } from './types.ts'

export type QuestionFieldProps = (
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
) & { footer?: string }

const QuestionFieldWrapper: FC<{
  label?: string
  footer?: string
  layout?: 'full' | 'half'
  info?: ReactNode | ReactNode[] | string
  className?: string
  children: ReactNode
}> = ({ label, footer, layout = 'full', info, className, children }) => (
  <div
    className={classNames(
      styles.questionFieldContainer,
      {
        full: styles.layoutFull,
        half: styles.layoutHalf,
        'half-exclusive': styles.layoutHalfExclusive,
      }[layout],
    )}>
    <div className={styles.label}>
      {label && <span>{label}</span>}
      {info && <IconTooltip icon={faCircleInfo}>{info}</IconTooltip>}
    </div>
    <div className={classNames(styles.content, className)}>{children}</div>
    {footer && <div className={styles.footer}>{footer}</div>}
  </div>
)

const QuestionField: FC<QuestionFieldProps> = (props) => {
  switch (props.type) {
    case QuestionFieldType.CommonDuration:
      return (
        <QuestionFieldWrapper
          label="Time Limit"
          layout="half"
          info={
            <>
              The time limit for answering the question. The allowed values are:
              <ul>
                <li>5 seconds</li>
                <li>10 seconds</li>
                <li>20 seconds</li>
                <li>30 seconds</li>
                <li>45 seconds</li>
                <li>1 minute</li>
                <li>1 minute 30 seconds</li>
                <li>2 minutes</li>
                <li>3 minutes</li>
                <li>4 minutes</li>
              </ul>
            </>
          }
          footer={props.footer}>
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
                key: '10',
                value: '10',
                valueLabel: '10 seconds',
              },
              {
                key: '20',
                value: '20',
                valueLabel: '20 seconds',
              },
              {
                key: '30',
                value: '30',
                valueLabel: '30 seconds',
              },
              {
                key: '45',
                value: '45',
                valueLabel: '45 seconds',
              },
              {
                key: '60',
                value: '60',
                valueLabel: '1 minute',
              },
              {
                key: '90',
                value: '90',
                valueLabel: '1 minute 30 seconds',
              },
              {
                key: '120',
                value: '120',
                valueLabel: '2 minutes',
              },
              {
                key: '180',
                value: '180',
                valueLabel: '3 minutes',
              },
              {
                key: '240',
                value: '240',
                valueLabel: '4 minutes',
              },
            ]}
            onChange={(value) => props.onChange(parseInt(value))}
            onValid={props.onValid}
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.CommonMedia:
      return (
        <QuestionFieldWrapper layout="full" footer={props.footer}>
          <MediaQuestionField
            value={props.value}
            onChange={props.onChange}
            onValid={props.onValid}
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.CommonPoints:
      return (
        <QuestionFieldWrapper
          label="Points"
          layout="half"
          info={
            <>
              The maximum number of points awarded for a correct answer. The
              allowed values are:
              <ul>
                <li>Zero Points</li>
                <li>Standard Points (1000)</li>
                <li>Double Points (2000)</li>
              </ul>
            </>
          }
          footer={props.footer}>
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
            onValid={props.onValid}
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.CommonQuestion:
      return (
        <QuestionFieldWrapper
          label="Question"
          layout="full"
          footer={props.footer}>
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
            onValid={props.onValid}
            forceValidate
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.CommonType:
      return (
        <QuestionFieldWrapper label="Type" layout="half" footer={props.footer}>
          <Select
            id="question-type-select"
            value={props.value}
            values={Object.values(QuestionType).map((type) => ({
              key: type,
              value: type,
              valueLabel: QuestionTypeLabels[type],
            }))}
            onChange={(value) => props.onChange(value as QuestionType)}
            onValid={props.onValid}
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.MultiChoiceOptions:
      return (
        <QuestionFieldWrapper
          label="Options"
          layout="full"
          info="The list of possible answers for a question."
          footer={props.footer}>
          <MultiChoiceOptions {...props} />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.RangeCorrect:
      return (
        <QuestionFieldWrapper
          label="Correct"
          layout="half"
          info="The correct value for the range question, which must be within the range of min and max."
          footer={props.footer}>
          <TextField
            id="range-correct-textfield"
            type="number"
            placeholder=""
            value={props.value}
            min={props.min}
            max={props.max}
            onChange={(value) => props.onChange(value as number)}
            onValid={props.onValid}
            required
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.RangeMargin:
      return (
        <QuestionFieldWrapper
          label="Margin"
          layout="half"
          info={
            <>
              Specifies the margin of error allowed for a range question.
              Determines how close a player’s answer must be to the correct
              value to be considered correct or partially correct. The margin
              can be one of the following:
              <ul>
                <li>None: Only the exact correct answer is accepted.</li>
                <li>Low: Accepts answers within ±5% of the correct value. </li>
                <li>Medium: Accepts answers within ±10%.</li>
                <li>High: Accepts answers within ±20%. </li>
                <li>Maximum: Any answer is considered correct.</li>
              </ul>
            </>
          }
          footer={props.footer}>
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
            onValid={props.onValid}
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.RangeMax:
      return (
        <QuestionFieldWrapper
          label="Max"
          layout="half"
          info="The maximum possible value for the range question."
          footer={props.footer}>
          <TextField
            id="range-max-textfield"
            type="number"
            placeholder="Max"
            value={props.value}
            onChange={(value) => props.onChange(value as number)}
            onValid={props.onValid}
            required
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.RangeMin:
      return (
        <QuestionFieldWrapper
          label="Min"
          layout="half"
          info="The minimum possible value for the range question."
          footer={props.footer}>
          <TextField
            id="range-min-textfield"
            type="number"
            placeholder="Min"
            value={props.value}
            onChange={(value) => props.onChange(value as number)}
            onValid={(valid) => props.onValid(valid)}
            forceValidate
            required
          />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.TrueFalseOptions:
      return (
        <QuestionFieldWrapper
          label="Options"
          layout="full"
          footer={props.footer}
          className={styles.optionsContainer}>
          <TrueFalseOptions {...props} />
        </QuestionFieldWrapper>
      )
    case QuestionFieldType.TypeAnswerOptions:
      return (
        <QuestionFieldWrapper
          label="Options"
          layout="full"
          info="The list of allowed typed answers for a question."
          footer={props.footer}
          className={styles.optionsContainer}>
          <TypeAnswerOptions {...props} />
        </QuestionFieldWrapper>
      )
  }
}

export default QuestionField
