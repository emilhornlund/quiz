import { faClock, faEye } from '@fortawesome/free-solid-svg-icons'
import type { QuizResponseDto } from '@klurigo/common'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { CardMetaItem, MediaInfoCard } from '../../../../../../components'
import { QuizVisibilityLabels } from '../../../../../../models'
import {
  DATE_FORMATS,
  formatLocalDate,
  formatTimeAgo,
} from '../../../../../../utils/date.utils'

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
 * Displays the quiz cover, title, visibility, and last updated time.
 */
const ProfileQuizCard: FC<ProfileQuizCardProps> = ({ quiz }) => {
  const navigate = useNavigate()

  const handleClick = (): void => {
    navigate(`/quiz/details/${quiz.id}`)
  }

  const meta = (
    <>
      <CardMetaItem icon={faEye} data-testid="meta-visibility">
        {QuizVisibilityLabels[quiz.visibility]}
      </CardMetaItem>

      <CardMetaItem
        icon={faClock}
        title={formatLocalDate(quiz.updated, DATE_FORMATS.DATE_TIME_SECONDS)}
        data-testid="meta-updated">
        {formatTimeAgo(quiz.updated)}
      </CardMetaItem>
    </>
  )

  return (
    <MediaInfoCard
      title={quiz.title}
      imageURL={quiz.imageCoverURL}
      imageAlt={quiz.title}
      meta={meta}
      onClick={handleClick}
      data-testid="profile-quiz-card"
    />
  )
}

export default ProfileQuizCard
