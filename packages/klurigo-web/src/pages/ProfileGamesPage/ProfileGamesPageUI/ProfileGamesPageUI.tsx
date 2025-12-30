import { faMagnifyingGlass, faPlus } from '@fortawesome/free-solid-svg-icons'
import type { GameHistoryDto } from '@klurigo/common'
import { GameStatus } from '@klurigo/common'
import { type FC, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Button,
  Page,
  PageDivider,
  Pagination,
  Typography,
} from '../../../components'

import GameTable from './components/GameTable'

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

  const isEmpty = useMemo(() => !items.length, [items])

  if (isEmpty) {
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
    <Page align="start" width="medium" discover profile>
      <Typography variant="title">Game History</Typography>

      <Typography variant="text">
        Review your past games and track your performance.
      </Typography>

      <GameTable items={items} onClick={onClick} />

      <Pagination
        total={total}
        limit={limit}
        offset={offset}
        onChange={onChangePagination}
      />
    </Page>
  )
}

export default ProfileGamesPageUI
