import {
  faArrowRotateLeft,
  faMagnifyingGlass,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import type { GameHistoryDto } from '@klurigo/common'
import { GameStatus } from '@klurigo/common'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Page, PageDivider, Typography } from '../../../../components'

import { ProfileGameCard, ProfileGameCardSkeleton } from './components'
import styles from './ProfileGamesPageUI.module.scss'

export interface ProfileGamesPageUIProps {
  games: GameHistoryDto[]
  isLoading: boolean
  isLoadingMore: boolean
  isError: boolean
  hasMore: boolean
  skeletonCount: number
  onLoadMore: () => void
  onClick: (id: string, status: GameStatus) => void
}

const ProfileGamesPageUI: FC<ProfileGamesPageUIProps> = ({
  games,
  isLoading,
  isLoadingMore,
  isError,
  hasMore,
  skeletonCount,
  onLoadMore,
  onClick,
}) => {
  const navigate = useNavigate()

  if (!isLoading && !isError && games.length === 0) {
    return (
      <Page align="start" width="medium" discover profile>
        <Typography variant="title">No Games Yet</Typography>
        <Typography variant="text">
          Host live quizzes and play together with others. Your games will
          appear here once you start.
        </Typography>

        <PageDivider />

        <Typography variant="subtitle" size="medium">
          Looking for something to play?
        </Typography>
        <Typography variant="text" size="medium">
          Browse quizzes made by others and host a live game in seconds.
        </Typography>
        <Button
          id="discover-quizzes-button"
          type="button"
          kind="primary"
          size="small"
          value="Discover quizzes"
          icon={faMagnifyingGlass}
          iconPosition="leading"
          onClick={() => navigate('/discover')}
        />

        <PageDivider />

        <Typography variant="subtitle" size="medium">
          Want to make your own?
        </Typography>
        <Typography variant="text" size="medium">
          Create a quiz in minutes and reuse it for future games.
        </Typography>
        <Button
          id="create-quiz-button"
          type="button"
          kind="call-to-action"
          size="small"
          value="Create a quiz"
          icon={faPlus}
          iconPosition="leading"
          onClick={() => navigate('/quiz/create')}
        />
      </Page>
    )
  }

  return (
    <Page align="start" discover profile>
      <Typography variant="title">Game History</Typography>
      <Typography variant="text" size="medium">
        Review your past games and track your performance.
      </Typography>
      {isError ? (
        <p
          className={styles.emptyState}
          data-testid="profile-games-empty-state">
          Oops! Your game history is playing hide-and-seek right now. Please try
          again.
        </p>
      ) : (
        <>
          <div className={styles.grid} data-testid="profile-game-grid">
            {isLoading && games.length === 0
              ? Array.from({ length: skeletonCount }).map((_, i) => (
                  <ProfileGameCardSkeleton key={i} />
                ))
              : games.map((game) => (
                  <ProfileGameCard
                    key={game.id}
                    game={game}
                    onClick={onClick}
                  />
                ))}
          </div>
          {hasMore && (
            <div className={styles.loadMoreContainer}>
              <Button
                id="load-more-games-button"
                type="button"
                icon={faArrowRotateLeft}
                loading={isLoadingMore}
                onClick={onLoadMore}
                data-testid="load-more-games-button">
                Load more games
              </Button>
            </div>
          )}
        </>
      )}
    </Page>
  )
}

export default ProfileGamesPageUI
