import type { IconDefinition } from '@fortawesome/fontawesome-common-types'
import {
  faCalendarCheck,
  faCalendarPlus,
  faCircleQuestion,
  faCommentDots,
  faEye,
  faGamepad,
  faIcons,
  faLanguage,
  faPen,
  faPlay,
  faStar,
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
import colors from '../../../../styles/colors.module.scss'
import { DATE_FORMATS, formatLocalDate } from '../../../../utils/date.utils'

import styles from './QuizDetailsPageUI.module.scss'

const DetailItem: FC<{
  icon: IconDefinition
  value: string
  title?: string
}> = ({ value, icon, title }) => (
  <div className={styles.item} title={title ?? value}>
    <FontAwesomeIcon icon={icon} className={styles.icon} />
    <span className={styles.value}>{value}</span>
  </div>
)

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
    <Page align="start" height="full" noPadding discover profile>
      <div className={styles.layout}>
        <Typography variant="title" size="full">
          {quiz.title}
        </Typography>

        {quiz.description && (
          <Typography variant="text" size="medium">
            {quiz.description}
          </Typography>
        )}

        <div className={styles.actions}>
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
        </div>

        <div className={styles.misc}>
          <div className={styles.column}>
            <FontAwesomeIcon
              icon={faStar}
              color={colors.yellow2}
              className={styles.icon}
            />
            <span className={styles.value}>{quiz.ratingSummary.stars}</span>
          </div>
          <div className={styles.column}>
            <FontAwesomeIcon
              icon={faCommentDots}
              color={colors.white}
              className={styles.icon}
            />
            <span className={styles.value}>{quiz.ratingSummary.comments}</span>
          </div>
        </div>

        {quiz.imageCoverURL && (
          <div className={styles.thumbnailContainer}>
            <ResponsiveImage imageURL={quiz.imageCoverURL} />
          </div>
        )}

        <div className={styles.details}>
          <DetailItem
            icon={faEye}
            value={QuizVisibilityLabels[quiz.visibility]}
          />
          <DetailItem
            icon={faIcons}
            value={QuizCategoryLabels[quiz.category]}
          />
          <DetailItem
            icon={faLanguage}
            value={LanguageLabels[quiz.languageCode]}
          />
          <DetailItem icon={faGamepad} value={GameModeLabels[quiz.mode]} />
          <DetailItem
            icon={faCircleQuestion}
            value={`${quiz.numberOfQuestions} ${quiz.numberOfQuestions === 1 ? 'Question' : 'Questions'}`}
          />
          <DetailItem
            icon={faCalendarPlus}
            value={formatLocalDate(quiz.created, DATE_FORMATS.DATE_TIME)}
            title={`Created ${formatLocalDate(quiz.created, DATE_FORMATS.DATE_TIME_SECONDS)}`}
          />
          <DetailItem
            icon={faCalendarCheck}
            value={formatLocalDate(quiz.updated, DATE_FORMATS.DATE_TIME)}
            title={`Updated ${formatLocalDate(quiz.updated, DATE_FORMATS.DATE_TIME_SECONDS)}`}
          />
          <DetailItem icon={faUser} value={quiz.author.name || 'N/A'} />
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
