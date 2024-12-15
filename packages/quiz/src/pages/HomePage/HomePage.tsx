import { GAME_PIN_REGEX } from '@quiz/common'
import React, { FC, FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import {
  IconButtonArrowRight,
  Page,
  RocketImage,
  TextField,
  Typography,
} from '../../components'

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
  const navigate = useNavigate()

  const { findGame } = useQuizServiceClient()

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
      findGame(gamePIN).then(({ id }) => navigate(`/join?gameID=${id}`))
    }
  }

  return (
    <Page profile>
      <RocketImage />
      <Typography variant="title" size="medium">
        Let’s play
      </Typography>
      <Typography variant="text" size="small">
        {message}
      </Typography>
      <form className={styles.joinForm} onSubmit={handleJoinSubmit}>
        <TextField
          id="game-pin"
          type="text"
          placeholder="Game PIN"
          value={gamePIN ?? ''}
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
      <Link to={'/create'}>
        <Typography variant="link">Create your own quiz</Typography>
      </Link>
    </Page>
  )
}

export default HomePage
