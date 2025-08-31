import { GAME_PIN_LENGTH, GAME_PIN_REGEX } from '@quiz/common'
import React, { FC, FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import KlurigoIcon from '../../assets/images/klurigo-icon.svg'
import {
  Button,
  Page,
  PageProminentIcon,
  TextField,
  Typography,
} from '../../components'
import { useAuthContext } from '../../context/auth'

import styles from './HomePage.module.scss'

const HomePage: FC = () => {
  const { isUserAuthenticated } = useAuthContext()

  const navigate = useNavigate()

  const [gamePIN, setGamePIN] = useState<string>()
  const [gamePINValid, setGamePINValid] = useState<boolean>(false)

  const handleJoinSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (gamePIN) {
      navigate(`/auth/game?pin=${gamePIN}`)
    }
  }

  const handleCreateQuizClick = () => {
    if (isUserAuthenticated) {
      navigate('/quiz/create')
    } else {
      navigate('/auth/login')
    }
  }

  return (
    <Page discover profile>
      <div className={styles.animatedLogo}>
        <PageProminentIcon src={KlurigoIcon} alt="Klurigo" />
      </div>
      <div className={styles.heroSection}>
        <Typography variant="hero">Think Fast. Score Big. Win Live.</Typography>
        <Typography variant="text" size="medium">
          Real-time multiplayer quizzes with leaderboards, power-ups, and
          bragging rights.
        </Typography>
      </div>
      <form className={styles.joinForm} onSubmit={handleJoinSubmit}>
        <TextField
          id="game-pin"
          type="text"
          kind="modern"
          placeholder="Game PIN"
          value={gamePIN}
          minLength={GAME_PIN_LENGTH}
          maxLength={GAME_PIN_LENGTH}
          regex={GAME_PIN_REGEX}
          onChange={(value) => setGamePIN(value as string)}
          onValid={setGamePINValid}
          required
        />
        <Button
          id="join-game"
          type="submit"
          variant="modern"
          disabled={!gamePINValid}>
          Join the game →
        </Button>
      </form>
      <Button
        id="create-quiz"
        type="button"
        kind="plain"
        onClick={handleCreateQuizClick}>
        {isUserAuthenticated
          ? 'Create your own quiz and challenge others!'
          : 'Want to create your own quiz? Log in to get started.'}
      </Button>
    </Page>
  )
}

export default HomePage
