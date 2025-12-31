import {
  faCalendarCheck,
  faCalendarPlus,
  faCircleQuestion,
  faEye,
  faGamepad,
  faIcons,
  faLanguage,
  faPen,
  faPlay,
  faTrash,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { QuizResponseDto } from '@klurigo/common'
import type { FC } from 'react'
import { useState } from 'react'

import {
  Button,
  ConfirmDialog,
  LoadingSpinner,
  Page,
  ResponsiveImage,
  Typography,
} from '../../../../components'
import {
  GameModeLabels,
  LanguageLabels,
  QuizCategoryLabels,
  QuizVisibilityLabels,
} from '../../../../models'
import { DATE_FORMATS, formatLocalDate } from '../../../../utils/date.utils'

import styles from './QuizDetailsPageUI.module.scss'

export interface QuizDetailsPageUIProps {
  quiz?: QuizResponseDto
  isOwner?: boolean
  isLoadingQuiz?: boolean
  isHostGameLoading?: boolean
  isDeleteQuizLoading?: boolean
  onHostGame: () => void
  onEditQuiz: () => void
  onDeleteQuiz: () => void
}

const QuizDetailsPageUI: FC<QuizDetailsPageUIProps> = ({
  quiz,
  isOwner = false,
  isLoadingQuiz,
  isHostGameLoading,
  isDeleteQuizLoading,
  onHostGame,
  onEditQuiz,
  onDeleteQuiz,
}) => {
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false)

  const [showConfirmHostGameModal, setShowConfirmHostGameModal] =
    useState<boolean>(false)

  if (!quiz || isLoadingQuiz) {
    return (
      <Page align="start" height="full" profile>
        <LoadingSpinner />
      </Page>
    )
  }

  return (
    <Page
      align="start"
      height="full"
      header={
        <>
          {isOwner && (
            <>
              <Button
                id="delete-quiz-button"
                type="button"
                kind="destructive"
                size="small"
                value="Delete"
                hideValue="mobile"
                icon={faTrash}
                onClick={() => setShowConfirmDeleteDialog(true)}
              />
              <Button
                id="edit-quiz-button"
                type="button"
                kind="primary"
                size="small"
                value="Edit"
                hideValue="mobile"
                icon={faPen}
                onClick={onEditQuiz}
              />
            </>
          )}
          <Button
            id="host-game-button"
            type="button"
            kind="call-to-action"
            size="small"
            value="Host Game"
            hideValue="mobile"
            icon={faPlay}
            onClick={() => setShowConfirmHostGameModal(true)}
          />
        </>
      }
      discover
      profile>
      <Typography variant="title">{quiz.title}</Typography>

      {quiz.description && (
        <Typography variant="text" size="medium">
          {quiz.description}
        </Typography>
      )}

      {quiz.imageCoverURL && <ResponsiveImage imageURL={quiz.imageCoverURL} />}

      <div className={styles.details}>
        <div className={styles.item}>
          <FontAwesomeIcon icon={faEye} className={styles.icon} />
          <span className={styles.value}>
            {QuizVisibilityLabels[quiz.visibility]}
          </span>
        </div>
        <div className={styles.item}>
          <FontAwesomeIcon icon={faIcons} className={styles.icon} />
          <span className={styles.value}>
            {QuizCategoryLabels[quiz.category]}
          </span>
        </div>
        <div className={styles.item}>
          <FontAwesomeIcon icon={faLanguage} className={styles.icon} />
          <span className={styles.value}>
            {LanguageLabels[quiz.languageCode]}
          </span>
        </div>
        <div className={styles.item}>
          <FontAwesomeIcon icon={faGamepad} className={styles.icon} />
          <span className={styles.value}>{GameModeLabels[quiz.mode]}</span>
        </div>
        <div className={styles.item}>
          <FontAwesomeIcon icon={faCircleQuestion} className={styles.icon} />
          <span className={styles.value}>
            {quiz.numberOfQuestions}{' '}
            {quiz.numberOfQuestions === 1 ? 'Question' : 'Questions'}
          </span>
        </div>
        <div
          className={styles.item}
          title={`Created ${formatLocalDate(quiz.created, DATE_FORMATS.DATE_TIME_SECONDS)}`}>
          <FontAwesomeIcon icon={faCalendarPlus} className={styles.icon} />
          <span className={styles.value}>
            {formatLocalDate(quiz.created, DATE_FORMATS.DATE_TIME)}
          </span>
        </div>
        <div
          className={styles.item}
          title={`Updated ${formatLocalDate(quiz.updated, DATE_FORMATS.DATE_TIME_SECONDS)}`}>
          <FontAwesomeIcon icon={faCalendarCheck} className={styles.icon} />
          <span className={styles.value}>
            {formatLocalDate(quiz.updated, DATE_FORMATS.DATE_TIME)}
          </span>
        </div>
        <div className={styles.item}>
          <FontAwesomeIcon icon={faUser} className={styles.icon} />
          <span className={styles.value}>{quiz.author.name || 'N/A'}</span>
        </div>
      </div>

      <ConfirmDialog
        title="Host Game"
        message="Are you sure you want to start hosting a new game? Players will be able to join as soon as the game starts."
        open={showConfirmHostGameModal}
        loading={isHostGameLoading}
        onConfirm={onHostGame}
        onClose={() => setShowConfirmHostGameModal(false)}
      />

      <ConfirmDialog
        title="Delete Quiz"
        message="Are you sure you want to delete this quiz?"
        open={showConfirmDeleteDialog}
        loading={isDeleteQuizLoading}
        onConfirm={onDeleteQuiz}
        onClose={() => setShowConfirmDeleteDialog(false)}
        destructive
      />
    </Page>
  )
}

export default QuizDetailsPageUI
