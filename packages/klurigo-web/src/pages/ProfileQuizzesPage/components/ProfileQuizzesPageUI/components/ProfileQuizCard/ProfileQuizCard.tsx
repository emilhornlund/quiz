import { faClock, faEye, faImage } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { QuizResponseDto } from '@klurigo/common'
import type { FC, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import ResponsiveImage from '../../../../../../components/ResponsiveImage'
import { QuizVisibilityLabels } from '../../../../../../models'
import {
  DATE_FORMATS,
  formatLocalDate,
  formatTimeAgo,
} from '../../../../../../utils/date.utils'
import { classNames } from '../../../../../../utils/helpers'

import styles from './ProfileQuizCard.module.scss'

/**
 * Props for the ProfileQuizCard component.
 */
export type ProfileQuizCardProps = {
  /** The quiz data to display in the card. */
  readonly quiz: QuizResponseDto
}

/**
 * Renders a compact quiz card for use in the profile quizzes page.
 *
 * Displays a cover image (with SVG fallback), title, visibility label,
 * question count, and last updated time. Clicking the card navigates
 * to the quiz details page.
 */
const ProfileQuizCard: FC<ProfileQuizCardProps> = ({ quiz }) => {
  const navigate = useNavigate()

  const handleClick = (): void => {
    navigate(`/quiz/details/${quiz.id}`)
  }

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-testid="profile-quiz-card">
      <div className={styles.cover}>
        {quiz.imageCoverURL ? (
          <ResponsiveImage
            imageURL={quiz.imageCoverURL}
            alt={quiz.title}
            fit="fill"
            noCornerRadius
            noBorder
          />
        ) : (
          <div className={styles.coverFallback} data-testid="cover-fallback">
            <FontAwesomeIcon icon={faImage} />
          </div>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title} title={quiz.title}>
          {quiz.title}
        </h3>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <FontAwesomeIcon icon={faEye} />
            {QuizVisibilityLabels[quiz.visibility]}
          </span>
          <span
            className={classNames(styles.metaItem, styles.updated)}
            title={`Updated ${formatLocalDate(quiz.updated, DATE_FORMATS.DATE_TIME_SECONDS)}`}>
            <FontAwesomeIcon icon={faClock} />
            {formatTimeAgo(quiz.updated)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProfileQuizCard
