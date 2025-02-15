import { faFloppyDisk, faGear } from '@fortawesome/free-solid-svg-icons'
import { GameMode, QuestionType } from '@quiz/common'
import React, { FC } from 'react'

import { Button, Page, TextField } from '../../../../components'
import {
  DeviceType,
  useDeviceSizeType,
} from '../../../../utils/use-device-size.tsx'
import { QuestionData } from '../../utils/QuestionDataSource/question-data-source.types.ts'

import {
  GameModeSelectionModal,
  QuestionEditor,
  QuestionPicker,
} from './components'
import styles from './QuizCreatorPageUI.module.scss'

export interface QuizCreatorPageUIProps {
  gameMode?: GameMode
  onSelectGameMode?: (gameMode: GameMode) => void
  questions: QuestionData[]
  selectedQuestion?: QuestionData
  selectedQuestionIndex: number
  onSelectedQuestionIndex: (index: number) => void
  onAddQuestion: () => void
  onEditQuestion: (data: QuestionData) => void
  onDropQuestionIndex: (index: number) => void
  onDuplicateQuestionIndex: (index: number) => void
  onDeleteQuestionIndex: (index: number) => void
}

const QuizCreatorPageUI: FC<QuizCreatorPageUIProps> = ({
  gameMode,
  onSelectGameMode,
  questions,
  selectedQuestion,
  selectedQuestionIndex,
  onSelectedQuestionIndex,
  onAddQuestion,
  onEditQuestion,
  onDropQuestionIndex,
  onDuplicateQuestionIndex,
  onDeleteQuestionIndex,
}) => {
  const deviceType = useDeviceSizeType()

  return (
    <Page
      height="full"
      header={
        <div className={styles.quizCreatorPageHeader}>
          {deviceType !== DeviceType.Mobile && (
            <TextField
              id="quiz-title-text-field"
              size="small"
              type="text"
              placeholder="Title"
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
          />
          <Button
            id="save-button"
            type="button"
            size="small"
            kind="call-to-action"
            value="Save"
            hideValue="mobile"
            icon={faFloppyDisk}
          />
        </div>
      }>
      <div className={styles.quizCreatorPage}>
        {!gameMode && <GameModeSelectionModal onSelect={onSelectGameMode} />}
        {gameMode && selectedQuestion && (
          <>
            <QuestionPicker
              questions={questions.map(({ data, validation }) => ({
                type: data.type as QuestionType,
                text: data.question,
                error: Object.keys(validation).length
                  ? 'Some error here'
                  : undefined,
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
              onChange={onEditQuestion}
            />
          </>
        )}
      </div>
    </Page>
  )
}

export default QuizCreatorPageUI
