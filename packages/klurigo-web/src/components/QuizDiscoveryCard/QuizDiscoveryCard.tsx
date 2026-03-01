import {
  faImage,
  faListOl,
  faPlay,
  faStar,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { DiscoveryQuizCardDto } from '@klurigo/common'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { classNames } from '../../utils/helpers'

import styles from './QuizDiscoveryCard.module.scss'

/**
 * Props for the QuizDiscoveryCard component.
 */
export type QuizDiscoveryCardProps = {
  /** The quiz data to display in the card. */
  readonly quiz: DiscoveryQuizCardDto
}

/**
 * Renders a compact quiz card for use in discovery rails.
 *
 * Displays a cover image (with SVG fallback), title, author name,
 * question count, play count, and star rating. Clicking the card
 * navigates to the quiz details page.
 */
const QuizDiscoveryCard: FC<QuizDiscoveryCardProps> = ({ quiz }) => {
  const navigate = useNavigate()

  const handleClick = (): void => {
    navigate(`/quiz/details/${quiz.id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
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
      data-testid="quiz-discovery-card">
      <div className={styles.cover}>
        {quiz.imageCoverURL ? (
          <img
            src={quiz.imageCoverURL}
            alt={quiz.title}
            className={styles.coverImage}
          />
        ) : (
          <div className={styles.coverFallback} data-testid="cover-fallback">
            <FontAwesomeIcon icon={faImage} />
          </div>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{quiz.title}</h3>
        <span className={styles.author}>{quiz.author.name}</span>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <FontAwesomeIcon icon={faListOl} />
            {quiz.numberOfQuestions}
          </span>
          <span className={styles.metaItem}>
            <FontAwesomeIcon icon={faPlay} />
            {quiz.gameplaySummary.count}
          </span>
          {quiz.ratingSummary.stars > 0 && (
            <span className={classNames(styles.metaItem, styles.rating)}>
              <FontAwesomeIcon icon={faStar} />
              {quiz.ratingSummary.stars.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizDiscoveryCard
