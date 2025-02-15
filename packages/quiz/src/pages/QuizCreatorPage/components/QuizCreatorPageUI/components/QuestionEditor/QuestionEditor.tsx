import { GameMode, QuestionRangeAnswerMargin, QuestionType } from '@quiz/common'
import React, { FC } from 'react'

import {
  ClassicModeQuestionValidationModel,
  QuestionData,
} from '../../../../utils/QuestionDataSource/question-data-source.types.ts'
import {
  isClassicMultiChoiceQuestion,
  isClassicRangeQuestion,
  isClassicTrueFalseQuestion,
  isClassicTypeAnswerQuestion,
  isZeroToOneHundredRangeDto,
} from '../../../../utils/QuestionDataSource/question-data-source.utils.ts'

import {
  ClassicMultiChoiceOptionQuestionForm,
  ClassicRangeQuestionForm,
  ClassicTrueFalseQuestionForm,
  ClassicTypeAnswerQuestionForm,
  QuestionField,
  QuestionFieldType,
  ZeroToOneHundredRangeQuestionForm,
} from './components'
import styles from './QuestionEditor.module.scss'

export interface QuestionEditorProps {
  question: QuestionData
  onChange: (data: QuestionData) => void
}

const createQuestion = (
  original: ClassicModeQuestionValidationModel['data'],
  type: QuestionType,
): ClassicModeQuestionValidationModel['data'] => {
  switch (type) {
    case QuestionType.MultiChoice:
      return {
        type,
        question: original.question,
        media: original.media,
        options: [],
        points: original.points,
        duration: original.duration,
      }
    case QuestionType.TrueFalse:
      return {
        type,
        question: original.question,
        media: original.media,
        points: original.points,
        duration: original.duration,
      }
    case QuestionType.Range:
      return {
        type,
        question: original.question,
        media: original.media,
        min: 0,
        max: 100,
        margin: QuestionRangeAnswerMargin.Medium,
        points: original.points,
        duration: original.duration,
      }
    case QuestionType.TypeAnswer:
      return {
        type,
        question: original.question,
        media: original.media,
        options: [],
        points: original.points,
        duration: original.duration,
      }
  }
}

const QuestionEditor: FC<QuestionEditorProps> = ({ question, onChange }) => {
  return (
    <div className={styles.questionEditorContainer}>
      {question.mode === GameMode.Classic && (
        <div className={styles.section}>
          <QuestionField
            type={QuestionFieldType.CommonType}
            value={question.data.type}
            onChange={(type) =>
              onChange({
                ...question,
                data: createQuestion(question.data, type),
              })
            }
            onValid={(newValid) =>
              onChange({
                ...question,
                validation: { ...question.validation, type: newValid },
              })
            }
          />
        </div>
      )}

      {isClassicMultiChoiceQuestion(question) && (
        <ClassicMultiChoiceOptionQuestionForm
          data={question.data}
          onChange={(field, value) =>
            onChange({
              ...question,
              data: { ...question.data, [field]: value },
            })
          }
          onValidChange={(field, valid) =>
            onChange({
              ...question,
              validation: { ...question.validation, [field]: valid },
            })
          }
        />
      )}

      {isClassicRangeQuestion(question) && (
        <ClassicRangeQuestionForm
          data={question.data}
          onChange={(field, value) =>
            onChange({
              ...question,
              data: { ...question.data, [field]: value },
            })
          }
          onValidChange={(field, valid) =>
            onChange({
              ...question,
              validation: { ...question.validation, [field]: valid },
            })
          }
        />
      )}

      {isClassicTrueFalseQuestion(question) && (
        <ClassicTrueFalseQuestionForm
          data={question.data}
          onChange={(field, value) =>
            onChange({
              ...question,
              data: { ...question.data, [field]: value },
            })
          }
          onValidChange={(field, valid) =>
            onChange({
              ...question,
              validation: { ...question.validation, [field]: valid },
            })
          }
        />
      )}

      {isClassicTypeAnswerQuestion(question) && (
        <ClassicTypeAnswerQuestionForm
          data={question.data}
          onChange={(field, value) =>
            onChange({
              ...question,
              data: { ...question.data, [field]: value },
            })
          }
          onValidChange={(field, valid) =>
            onChange({
              ...question,
              validation: { ...question.validation, [field]: valid },
            })
          }
        />
      )}

      {isZeroToOneHundredRangeDto(question) && (
        <ZeroToOneHundredRangeQuestionForm
          data={question.data}
          onChange={(field, value) =>
            onChange({
              ...question,
              data: { ...question.data, [field]: value },
            })
          }
          onValidChange={(field, valid) =>
            onChange({
              ...question,
              validation: { ...question.validation, [field]: valid },
            })
          }
        />
      )}
    </div>
  )
}

export default QuestionEditor
