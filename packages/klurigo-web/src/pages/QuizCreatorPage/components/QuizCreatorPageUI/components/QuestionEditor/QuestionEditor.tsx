import type { QuestionDto } from '@klurigo/common'
import { GameMode, QuestionType } from '@klurigo/common'
import type { FC } from 'react'

import {
  isClassicMultiChoiceQuestion,
  isClassicPinQuestion,
  isClassicPuzzleQuestion,
  isClassicRangeQuestion,
  isClassicTrueFalseQuestion,
  isClassicTypeAnswerQuestion,
  isZeroToOneHundredRangeQuestion,
} from '../../../../../../utils/questions'
import type {
  QuizQuestionModel,
  QuizQuestionModelFieldChangeFunction,
  QuizQuestionValidationResult,
} from '../../../../utils/QuestionDataSource'

import {
  ClassicMultiChoiceOptionQuestionForm,
  ClassicPinQuestionForm,
  ClassicPuzzleQuestionForm,
  ClassicRangeQuestionForm,
  ClassicTrueFalseQuestionForm,
  ClassicTypeAnswerQuestionForm,
  QuestionField,
  QuestionFieldType,
  ZeroToOneHundredRangeQuestionForm,
} from './components'
import styles from './QuestionEditor.module.scss'

export interface QuestionEditorProps {
  mode?: GameMode
  question: QuizQuestionModel
  questionValidation: QuizQuestionValidationResult
  onTypeChange: (type: QuestionType) => void
  onQuestionValueChange: QuizQuestionModelFieldChangeFunction<QuestionDto>
}

const QuestionEditor: FC<QuestionEditorProps> = ({
  mode,
  question,
  questionValidation,
  onTypeChange,
  onQuestionValueChange,
}) => {
  return (
    <div className={styles.questionEditorContainer}>
      {mode === GameMode.Classic && (
        <div className={styles.section}>
          <QuestionField
            type={QuestionFieldType.CommonType}
            value={question.type}
            validation={questionValidation}
            onChange={onTypeChange}
          />
        </div>
      )}

      {mode && isClassicMultiChoiceQuestion(mode, question) && (
        <ClassicMultiChoiceOptionQuestionForm
          question={question}
          questionValidation={questionValidation}
          onChange={onQuestionValueChange}
        />
      )}

      {mode && isClassicRangeQuestion(mode, question) && (
        <ClassicRangeQuestionForm
          question={question}
          questionValidation={questionValidation}
          onChange={onQuestionValueChange}
        />
      )}

      {mode && isClassicTrueFalseQuestion(mode, question) && (
        <ClassicTrueFalseQuestionForm
          question={question}
          questionValidation={questionValidation}
          onChange={onQuestionValueChange}
        />
      )}

      {mode && isClassicTypeAnswerQuestion(mode, question) && (
        <ClassicTypeAnswerQuestionForm
          question={question}
          questionValidation={questionValidation}
          onChange={onQuestionValueChange}
        />
      )}

      {mode && isClassicPinQuestion(mode, question) && (
        <ClassicPinQuestionForm
          question={question}
          questionValidation={questionValidation}
          onChange={onQuestionValueChange}
        />
      )}

      {mode && isClassicPuzzleQuestion(mode, question) && (
        <ClassicPuzzleQuestionForm
          question={question}
          questionValidation={questionValidation}
          onChange={onQuestionValueChange}
        />
      )}

      {mode && isZeroToOneHundredRangeQuestion(mode, question) && (
        <ZeroToOneHundredRangeQuestionForm
          question={question}
          questionValidation={questionValidation}
          onChange={onQuestionValueChange}
        />
      )}
    </div>
  )
}

export default QuestionEditor
