import { faMagnifyingGlass, faPlus } from '@fortawesome/free-solid-svg-icons'
import type { GameHistoryDto } from '@klurigo/common'
import { GameStatus } from '@klurigo/common'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Page, Pagination, Typography } from '../../../components'

import GameTable from './components/GameTable'
import styles from './ProfileGamesPageUI.module.scss'

export interface ProfileGamesPageUIProps {
  items: GameHistoryDto[]
  total: number
  limit: number
  offset: number
  onClick: (id: string, status: GameStatus) => void
  onChangePagination: (limit: number, offset: number) => void
}

const ProfileGamesPageUI: FC<ProfileGamesPageUIProps> = ({
  items,
  total,
  limit,
  offset,
  onClick,
  onChangePagination,
}) => {
  const navigate = useNavigate()

  return (
    <Page align="start" width="medium" discover profile>
      <Typography variant="title">
        {items.length ? 'Game History' : "You Haven't Played Any Games Yet"}
      </Typography>
      <Typography variant="text">
        {items.length
          ? 'Review your past games and track your performance.'
          : 'Once you play or host a game, it will appear here.'}
      </Typography>
      {!!items.length && (
        <>
          <GameTable items={items} onClick={onClick} />
          <Pagination
            total={total}
            limit={limit}
            offset={offset}
            onChange={onChangePagination}
          />
        </>
      )}
      {!items.length && (
        <div className={styles.gettingStarted}>
          <Button
            id="discover-quizzes-button"
            type="button"
            kind="primary"
            size="small"
            value="Discover Existing Quizzes"
            icon={faMagnifyingGlass}
            iconPosition="leading"
            onClick={() => navigate('/discover')}
          />
          <Typography variant="link">or</Typography>
          <Button
            id="create-quiz-button"
            type="button"
            kind="call-to-action"
            size="small"
            value="Create New Quiz"
            icon={faPlus}
            iconPosition="leading"
            onClick={() => navigate('/quiz/create')}
          />
        </div>
      )}
    </Page>
  )
}

export default ProfileGamesPageUI
