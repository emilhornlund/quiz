import type { FC, FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import UsersIcon from '../../assets/images/users-icon.svg'
import {
  IconButtonArrowLeft,
  IconButtonArrowRight,
  NicknameTextField,
  Page,
  PageProminentIcon,
  Typography,
} from '../../components'
import { useGameContext } from '../../context/game'
import { useUserContext } from '../../context/user'

import styles from './GameJoinPage.module.scss'
import { getMessage, getTitle } from './text.utils.ts'

const GameJoinPage: FC = () => {
  const navigate = useNavigate()

  const { currentUser } = useUserContext()

  const { gameID } = useGameContext()

  const { joinGame } = useQuizServiceClient()

  const [nickname, setNickname] = useState<string>(
    currentUser?.defaultNickname || '',
  )
  const [nicknameValid, setNicknameValid] = useState<boolean>(false)

  const title = useMemo<string>(() => getTitle(), [])
  const message = useMemo<string>(() => getMessage(), [])

  const [isJoiningGame, setIsJoiningGame] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (gameID && nickname && nicknameValid) {
      setIsJoiningGame(true)
      joinGame(gameID, nickname)
        .then(() => navigate(`/game`))
        .finally(() => setIsJoiningGame(false))
    }
  }

  return (
    <Page
      align="center"
      header={
        <IconButtonArrowLeft
          id="back-button"
          type="button"
          kind="call-to-action"
          size="small"
          value="Back"
          onClick={() => navigate(-1)}
        />
      }
      hideLogin>
      <PageProminentIcon src={UsersIcon} alt="Users" />
      <Typography variant="title" size="medium">
        {title}
      </Typography>
      <Typography variant="text" size="small">
        {message}
      </Typography>
      <form
        data-testid="join-form"
        name="join-game-form"
        className={styles.joinForm}
        onSubmit={handleSubmit}>
        <NicknameTextField
          value={nickname}
          placeholder="Nickname"
          disabled={isJoiningGame}
          onChange={setNickname}
          onValid={setNicknameValid}
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
