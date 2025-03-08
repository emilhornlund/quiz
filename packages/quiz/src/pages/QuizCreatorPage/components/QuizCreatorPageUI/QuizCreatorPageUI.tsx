import {
  faCode,
  faFloppyDisk,
  faGear,
  faSliders,
} from '@fortawesome/free-solid-svg-icons'
import {
  GameMode,
  QuestionType,
  QUIZ_TITLE_MAX_LENGTH,
  QUIZ_TITLE_MIN_LENGTH,
  QUIZ_TITLE_REGEX,
} from '@quiz/common'
import React, { FC, useMemo, useState } from 'react'

import { Button, Page, TextField } from '../../../../components'
import {
  DeviceType,
  useDeviceSizeType,
} from '../../../../utils/use-device-size.tsx'
import {
  QuestionData,
  QuestionValueChangeFunction,
  QuestionValueValidChangeFunction,
} from '../../utils/QuestionDataSource/question-data-source.types.ts'
import {
  QuizSettingsData,
  QuizSettingsDataSourceValidChangeFunction,
  QuizSettingsDataSourceValueChangeFunction,
} from '../../utils/QuizSettingsDataSource'

import {
  AdvancedQuestionEditor,
  GameModeSelectionModal,
  QuestionEditor,
  QuestionPicker,
} from './components'
import QuizSettingsModal from './components/QuizSettingsModal'
import styles from './QuizCreatorPageUI.module.scss'

export interface QuizCreatorPageUIProps {
  gameMode?: GameMode
  onSelectGameMode?: (gameMode: GameMode) => void
  quizSettings: Partial<QuizSettingsData>
  allQuizSettingsValid: boolean
  onQuizSettingsValueChange: QuizSettingsDataSourceValueChangeFunction
  onQuizSettingsValidChange: QuizSettingsDataSourceValidChangeFunction
  questions: QuestionData[]
  onSetQuestions: (questions: QuestionData[]) => void
  allQuestionsValid: boolean
  selectedQuestion?: QuestionData
  selectedQuestionIndex: number
  onSelectedQuestionIndex: (index: number) => void
  onAddQuestion: () => void
  onQuestionValueChange: QuestionValueChangeFunction
  onQuestionValueValidChange: QuestionValueValidChangeFunction
  onDropQuestionIndex: (index: number) => void
  onDuplicateQuestionIndex: (index: number) => void
  onDeleteQuestionIndex: (index: number) => void
  onReplaceQuestion: (type: QuestionType) => void
  isSavingQuiz?: boolean
  onSaveQuiz: () => void
}

const QuizCreatorPageUI: FC<QuizCreatorPageUIProps> = ({
  gameMode,
  onSelectGameMode,
  quizSettings,
  allQuizSettingsValid,
  onQuizSettingsValueChange,
  onQuizSettingsValidChange,
  questions,
  onSetQuestions,
  allQuestionsValid,
  selectedQuestion,
  selectedQuestionIndex,
  onSelectedQuestionIndex,
  onAddQuestion,
  onQuestionValueChange,
  onQuestionValueValidChange,
  onDropQuestionIndex,
  onDuplicateQuestionIndex,
  onDeleteQuestionIndex,
  onReplaceQuestion,
  isSavingQuiz,
  onSaveQuiz,
}) => {
  const deviceType = useDeviceSizeType()

  const [showQuizSettingsModal, setShowQuizSettingsModal] = useState(false)

  const [showAdvancedQuestionEditor, setShowAdvancedQuestionEditor] =
    useState(false)

  const isValid = useMemo(
    () => allQuestionsValid && allQuizSettingsValid,
    [allQuestionsValid, allQuizSettingsValid],
  )

  return (
    <Page
      height="full"
      header={
        <div className={styles.quizCreatorPageHeader}>
          {deviceType !== DeviceType.Mobile && (
            <TextField
              id="quiz-title-textfield"
              type="text"
              kind="secondary"
              size="small"
              placeholder="Title"
              value={quizSettings.title}
              minLength={QUIZ_TITLE_MIN_LENGTH}
              maxLength={QUIZ_TITLE_MAX_LENGTH}
              regex={QUIZ_TITLE_REGEX}
              onChange={(value) =>
                onQuizSettingsValueChange('title', value as string)
              }
              onValid={(valid) => onQuizSettingsValidChange('title', valid)}
              showErrorMessage={false}
              required
              forceValidate
            />
          )}
          <Button
            id="settings-button"
            type="button"
            size="small"
            kind="primary"
            value="Settings"
            hideValue="mobile"
            icon={faGear}
            onClick={() => setShowQuizSettingsModal(true)}
          />
          <Button
            id="save-button"
            type="button"
            size="small"
            kind="call-to-action"
            value="Save"
            hideValue="mobile"
            icon={faFloppyDisk}
            loading={!!isSavingQuiz}
            disabled={!isValid}
            onClick={onSaveQuiz}
          />
        </div>
      }>
      <div className={styles.quizCreatorPage}>
        {!gameMode && <GameModeSelectionModal onSelect={onSelectGameMode} />}

        {gameMode && showQuizSettingsModal && (
          <QuizSettingsModal
            values={quizSettings}
            onValueChange={onQuizSettingsValueChange}
            onValidChange={onQuizSettingsValidChange}
            onClose={() => setShowQuizSettingsModal(false)}
          />
        )}

        {gameMode && selectedQuestion && !showAdvancedQuestionEditor && (
          <>
            <QuestionPicker
              questions={questions.map(({ data, validation }) => ({
                type: data.type as QuestionType,
                text: data.question,
                error: Object.values(validation).some(
                  (valid) => valid === false,
                ),
              }))}
              selectedQuestionIndex={selectedQuestionIndex}
              onAddQuestion={onAddQuestion}
              onSelectQuestion={onSelectedQuestionIndex}
              onDropQuestion={onDropQuestionIndex}
              onDuplicateQuestion={onDuplicateQuestionIndex}
              onDeleteQuestion={onDeleteQuestionIndex}
            />
            <QuestionEditor
              question={selectedQuestion}
              onQuestionValueChange={onQuestionValueChange}
              onQuestionValueValidChange={onQuestionValueValidChange}
              onTypeChange={onReplaceQuestion}
            />
          </>
        )}

        {gameMode && showAdvancedQuestionEditor && (
          <AdvancedQuestionEditor
            gameMode={gameMode}
            questions={questions}
            onChange={onSetQuestions}
          />
        )}

        {gameMode && (
          <div className={styles.editorToggleSection}>
            <div className={styles.divider} />
            <div className={styles.toggleButtonWrapper}>
              <Button
                id="toggle-editor-button"
                type="button"
                size="small"
                value={
                  showAdvancedQuestionEditor
                    ? 'Show Simple Editor'
                    : 'Show Advanced Editor'
                }
                icon={showAdvancedQuestionEditor ? faSliders : faCode}
                onClick={() =>
                  setShowAdvancedQuestionEditor(!showAdvancedQuestionEditor)
                }
              />
            </div>
          </div>
        )}
      </div>
    </Page>
  )
}

export default QuizCreatorPageUI
