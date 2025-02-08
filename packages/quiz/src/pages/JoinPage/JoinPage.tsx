import {
  PLAYER_NICKNAME_MAX_LENGTH,
  PLAYER_NICKNAME_MIN_LENGTH,
  PLAYER_NICKNAME_REGEX,
} from '@quiz/common'
import React, { FC, FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import {
  IconButtonArrowLeft,
  IconButtonArrowRight,
  Page,
  TextField,
  Typography,
} from '../../components'
import { useAuthContext } from '../../context/auth'

import { getMessage, getTitle } from './helpers.ts'
import styles from './JoinPage.module.scss'

const JoinPage: FC = () => {
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  const { joinGame } = useQuizServiceClient()

  const gameID = useMemo(() => searchParams.get('gameID'), [searchParams])

  const [nickname, setNickname] = useState<string>()
  const [nicknameValid, setNicknameValid] = useState<boolean>(false)

  const { player, setPlayer } = useAuthContext()
  useEffect(() => {
    if (player?.nickname) {
      setNickname(player.nickname)
    }
  }, [player])

  const title = useMemo<string>(() => getTitle(), [])
  const message = useMemo<string>(() => getMessage(), [])

  const [isJoiningGame, setIsJoiningGame] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (player && nickname) {
      setPlayer({ ...player, nickname })
    }

    if (gameID && nickname) {
      setIsJoiningGame(true)
      joinGame(gameID, nickname)
        .then(() => navigate(`/game?gameID=${gameID}`))
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

export default JoinPage
