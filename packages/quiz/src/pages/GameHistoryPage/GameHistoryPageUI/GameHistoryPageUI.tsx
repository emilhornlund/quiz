import { faMagnifyingGlass, faPlus } from '@fortawesome/free-solid-svg-icons'
import { GameHistoryDto } from '@quiz/common'
import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Page, Pagination, Typography } from '../../../components'

import GameTable from './components/GameTable'
import styles from './GameHistoryPageUI.module.scss'

export interface GameHistoryPageUIProps {
  items: GameHistoryDto[]
  total: number
  limit: number
  offset: number
  onChangePagination: (limit: number, offset: number) => void
}

const GameHistoryPageUI: FC<GameHistoryPageUIProps> = ({
  items,
  total,
  limit,
  offset,
  onChangePagination,
}) => {
  const navigate = useNavigate()

  return (
    <Page align="start" height="full" width="medium" discover profile>
      <Typography variant="subtitle">
        {items.length ? 'Game History' : "You Haven't Played Any Games Yet"}
      </Typography>
      <Typography variant="text">
        {items.length
          ? 'Review your past games and track your performance.'
          : 'Once you play or host a game, it will appear here.'}
      </Typography>
      {!!items.length && (
        <>
          <GameTable items={items} />
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

export default GameHistoryPageUI
