import { GAME_PIN_LENGTH, GAME_PIN_REGEX } from '@quiz/common'
import type { FC, FormEvent } from 'react'
import { useMemo, useState } from 'react'
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
      <div className={styles.icon}>
        <PageProminentIcon src={KlurigoIcon} alt="Klurigo" />
      </div>
      <div className={styles.title}>
        <Typography variant="title" size="medium">
          Let’s play
        </Typography>
      </div>
      <div className={styles.message}>
        <Typography variant="text" size="small">
          {message}
        </Typography>
      </div>
      <form
        className={`${styles.joinForm} ${styles.form}`}
        onSubmit={handleJoinSubmit}>
        <TextField
          id="game-pin"
          type="text"
          placeholder="Game PIN"
          value={gamePIN ?? ''}
          minLength={GAME_PIN_LENGTH}
          maxLength={GAME_PIN_LENGTH}
          regex={GAME_PIN_REGEX}
          onChange={(value) => setGamePIN(value as string)}
          onValid={setGamePINValid}
          required
        />
        <IconButtonArrowRight
          id="join"
          type="submit"
          kind="call-to-action"
          value="Join the game"
          disabled={!gamePINValid}
        />
      </form>
      {isUserAuthenticated ? (
        <Link to={'/quiz/create'} className={styles.link}>
          <Typography variant="link" size="small">
            Create your own quiz and challenge others!
          </Typography>
        </Link>
      ) : (
        <Link to={'/auth/login'} className={styles.link}>
          <Typography variant="link" size="small">
            Want to create your own quiz? Log in to get started!
          </Typography>
        </Link>
      )}
    </Page>
  )
}

export default HomePage
