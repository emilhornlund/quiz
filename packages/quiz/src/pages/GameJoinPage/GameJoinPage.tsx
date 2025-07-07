import {
  PLAYER_NICKNAME_MAX_LENGTH,
  PLAYER_NICKNAME_MIN_LENGTH,
  PLAYER_NICKNAME_REGEX,
} from '@quiz/common'
import React, { FC, FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import UsersIcon from '../../assets/images/users-icon.svg'
import {
  IconButtonArrowLeft,
  IconButtonArrowRight,
  Page,
  PageProminentIcon,
  TextField,
  Typography,
} from '../../components'
import { useGameContext } from '../../context/game'

import styles from './GameJoinPage.module.scss'
import { getMessage, getTitle } from './helpers.ts'

const GameJoinPage: FC = () => {
  const navigate = useNavigate()

  const { gameID } = useGameContext()
  const { joinGame } = useQuizServiceClient()

  const [nickname, setNickname] = useState<string>()
  const [nicknameValid, setNicknameValid] = useState<boolean>(false)

  const title = useMemo<string>(() => getTitle(), [])
  const message = useMemo<string>(() => getMessage(), [])

  const [isJoiningGame, setIsJoiningGame] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (gameID && nickname) {
      setIsJoiningGame(true)
      joinGame(gameID, nickname)
        .then(() => navigate(`/game`))
        .finally(() => setIsJoiningGame(false))
    }
  }

  return (
    <Page
      header={
        <IconButtonArrowLeft
          id="back-button"
          type="button"
          kind="call-to-action"
          size="small"
          value="Back"
          onClick={() => navigate(-1)}
        />
      }>
      <PageProminentIcon src={UsersIcon} alt="Users" />
      <Typography variant="title" size="medium">
        {title}
      </Typography>
      <Typography variant="text" size="small">
        {message}
      </Typography>
      <form className={styles.joinForm} onSubmit={handleSubmit}>
        <TextField
          id="nickname"
          type="text"
          placeholder="Nickname"
          value={nickname ?? ''}
          minLength={PLAYER_NICKNAME_MIN_LENGTH}
          maxLength={PLAYER_NICKNAME_MAX_LENGTH}
          regex={PLAYER_NICKNAME_REGEX}
          disabled={isJoiningGame}
          onChange={(value) => setNickname(value as string)}
          onValid={setNicknameValid}
          required
        />
        <IconButtonArrowRight
          id="join"
          type="submit"
          kind="call-to-action"
          value="OK, Go!"
          loading={isJoiningGame}
          disabled={!nicknameValid}
        />
      </form>
    </Page>
  )
}

export default GameJoinPage
