import { faArrowRotateLeft, faPlus } from '@fortawesome/free-solid-svg-icons'
import type { QuizResponseDto } from '@klurigo/common'
import {
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizVisibility,
} from '@klurigo/common'
import type { FC } from 'react'

import { Button, Page, Typography } from '../../../../components'
import QuizTableFilter from '../../../../components/QuizTableFilter'

import { ProfileQuizCard, ProfileQuizCardSkeleton } from './components'
import styles from './ProfileQuizzesPageUI.module.scss'

export interface ProfileQuizzesPageUISearchParams {
  search?: string
  visibility?: QuizVisibility
  category?: QuizCategory
  languageCode?: LanguageCode
  mode?: GameMode
  sort?: 'title' | 'created' | 'updated'
  order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface ProfileQuizzesPageUIProps {
  quizzes: QuizResponseDto[]
  filter: ProfileQuizzesPageUISearchParams
  isLoading: boolean
  isError: boolean
  hasMore: boolean
  skeletonCount: number
  onLoadMore: () => void
  onChangeSearchParams: (params: ProfileQuizzesPageUISearchParams) => void
  onCreateQuiz: () => void
}

const ProfileQuizzesPageUI: FC<ProfileQuizzesPageUIProps> = ({
  quizzes,
  filter,
  isLoading,
  isError,
  hasMore,
  skeletonCount,
  onLoadMore,
  onChangeSearchParams,
  onCreateQuiz,
}) => {
  const hasSearchFilter = !!(
    filter.search?.length ||
    filter.visibility ||
    filter.category ||
    filter.languageCode ||
    filter.mode
  )

  return (
    <Page align="start" discover profile>
      <Typography variant="title">Your Quiz Shelf</Typography>
      <Typography variant="text" size="medium">
        All your quiz creations, lined up and ready for their next moment in the
        spotlight.
      </Typography>
      <Button
        id="create-quiz-button"
        type="button"
        kind="call-to-action"
        size="small"
        value="Create Quiz"
        icon={faPlus}
        iconPosition="leading"
        onClick={onCreateQuiz}
      />
      {(!!quizzes.length || hasSearchFilter) && (
        <QuizTableFilter
          filter={filter}
          onChange={onChangeSearchParams}
          showVisibilityFilter
        />
      )}
      {isError || (!isLoading && quizzes.length === 0) ? (
        <p className={styles.emptyState} data-testid="profile-empty-state">
          {isError
            ? 'Oops! Your quizzes are playing hide-and-seek right now. Please try again.'
            : hasSearchFilter
              ? 'No quiz cards matched that combo. Try mixing up your filters.'
              : 'Your quiz shelf is empty. Time to create your first one!'}
        </p>
      ) : (
        <>
          <div className={styles.grid} data-testid="profile-quiz-grid">
            {isLoading && quizzes.length === 0
              ? Array.from({ length: skeletonCount }).map((_, i) => (
                  <ProfileQuizCardSkeleton key={i} />
                ))
              : quizzes.map((quiz) => (
                  <ProfileQuizCard key={quiz.id} quiz={quiz} />
                ))}
          </div>
          {hasMore && !isLoading && (
            <div className={styles.loadMoreContainer}>
              <Button
                id="load-more-button"
                type="button"
                icon={faArrowRotateLeft}
                onClick={onLoadMore}
                data-testid="load-more-button">
                Load more quizzes
              </Button>
            </div>
          )}
        </>
      )}
    </Page>
  )
}

export default ProfileQuizzesPageUI
