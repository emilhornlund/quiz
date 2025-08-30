import { GAME_PIN_LENGTH, GAME_PIN_REGEX } from '@quiz/common'
import React, { FC, FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import KlurigoIcon from '../../assets/images/klurigo-icon.svg'
import {
  IconButtonArrowRight,
  Page,
  PageProminentIcon,
  TextField,
  Typography,
} from '../../components'
import { useAuthContext } from '../../context/auth'

import styles from './HomePage.module.scss'

const MESSAGES = [
  'Ready to show off your skills? Let’s go!',
  'Think you’ve got what it takes?',
  'The clock is ticking! Are you prepared?',
  'Time to put your knowledge to the test!',
  'Get your game face on. It’s time to win!',
  'Eyes on the prize! Are you ready?',
]

const HomePage: FC = () => {
  const { isUserAuthenticated } = useAuthContext()

  const navigate = useNavigate()

  const [gamePIN, setGamePIN] = useState<string>()
  const [gamePINValid, setGamePINValid] = useState<boolean>(false)

  const message = useMemo(
    () =>
      `Do you feel confident? ${MESSAGES[Math.floor(Math.random() * MESSAGES.length)]}`,
    [],
  )

  const handleJoinSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (gamePIN) {
      navigate(`/auth/game?pin=${gamePIN}`)
    }
  }

  return (
    <Page discover profile>
      <div className={styles.animatedLogo}>
        <PageProminentIcon src={KlurigoIcon} alt="Klurigo" />
      </div>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Think Fast. Score Big. Win Live.
        </h1>
        <p className={styles.heroSubtitle}>
          Real-time multiplayer quizzes with leaderboards, power-ups, and bragging rights.
        </p>
      </div>
      <form className={styles.joinForm} onSubmit={handleJoinSubmit}>
        <div className={styles.modernInput}>
          <input
            id="game-pin"
            type="text"
            placeholder="Game PIN"
            value={gamePIN ?? ''}
            minLength={GAME_PIN_LENGTH}
            maxLength={GAME_PIN_LENGTH}
            pattern={GAME_PIN_REGEX.source}
            onChange={(e) => setGamePIN(e.target.value)}
            onBlur={(e) => setGamePINValid(e.target.checkValidity())}
            required
          />
        </div>
        <button
          type="submit"
          className={styles.modernJoinButton}
          disabled={!gamePINValid}>
          Join the game →
        </button>
      </form>
      {isUserAuthenticated ? (
        <Link to={'/quiz/create'}>
          <Typography variant="link" size="small">
            Create a quiz. Log in to start.
          </Typography>
        </Link>
      ) : (
        <Link to={'/auth/login'}>
          <Typography variant="link" size="small">
            Create a quiz. Log in to start.
          </Typography>
        </Link>
      )}
    </Page>
  )
}

export default HomePage
