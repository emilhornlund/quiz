import { GameMode, QuestionType } from '@quiz/common'
import React, { FC } from 'react'

import {
  QuestionData,
  QuestionValueChangeFunction,
  QuestionValueValidChangeFunction,
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
  onTypeChange: (type: QuestionType) => void
  onQuestionValueChange: QuestionValueChangeFunction
  onQuestionValueValidChange: QuestionValueValidChangeFunction
}

const QuestionEditor: FC<QuestionEditorProps> = ({
  question,
  onTypeChange,
  onQuestionValueChange,
  onQuestionValueValidChange,
}) => {
  return (
    <div className={styles.questionEditorContainer}>
      {question.mode === GameMode.Classic && (
        <div className={styles.section}>
          <QuestionField
            type={QuestionFieldType.CommonType}
            value={question.data.type}
            onChange={onTypeChange}
            onValid={() => undefined}
          />
        </div>
      )}

      {isClassicMultiChoiceQuestion(question) && (
        <ClassicMultiChoiceOptionQuestionForm
          data={question.data}
          onChange={onQuestionValueChange}
          onValidChange={onQuestionValueValidChange}
        />
      )}

      {isClassicRangeQuestion(question) && (
        <ClassicRangeQuestionForm
          data={question.data}
          onChange={onQuestionValueChange}
          onValidChange={onQuestionValueValidChange}
        />
      )}

      {isClassicTrueFalseQuestion(question) && (
        <ClassicTrueFalseQuestionForm
          data={question.data}
          onChange={onQuestionValueChange}
          onValidChange={onQuestionValueValidChange}
        />
      )}

      {isClassicTypeAnswerQuestion(question) && (
        <ClassicTypeAnswerQuestionForm
          data={question.data}
          onChange={onQuestionValueChange}
          onValidChange={onQuestionValueValidChange}
        />
      )}

      {isZeroToOneHundredRangeDto(question) && (
        <ZeroToOneHundredRangeQuestionForm
          data={question.data}
          onChange={onQuestionValueChange}
          onValidChange={onQuestionValueValidChange}
        />
      )}
    </div>
  )
}

export default QuestionEditor
