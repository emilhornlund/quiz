import React, { FC, FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  IconButtonArrowRight,
  Page,
  RocketImage,
  TextField,
  Typography,
} from '../../components'
import { useQuizService } from '../../utils/use-quiz-service.tsx'

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

  const { findGame } = useQuizService()

  const [gamePIN, setGamePIN] = useState<string>()

  const message = useMemo(
    () =>
      `Do you feel confident? ${MESSAGES[Math.floor(Math.random() * MESSAGES.length)]}`,
    [],
  )

  const handleGamePINChange = (newGamePIN: string) => {
    if (newGamePIN.length == 0) {
      setGamePIN(undefined)
    } else {
      setGamePIN(newGamePIN)
    }
  }

  const handleJoinSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (gamePIN) {
      findGame(gamePIN).then(({ id }) => navigate(`/join?gameID=${id}`))
    }
  }

  return (
    <Page
      header={
        <a
          href="https://github.com/emilhornlund/quiz"
          target="_blank"
          rel="noreferrer">
          GitHub
        </a>
      }>
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
          onChange={handleGamePINChange}
        />
        <IconButtonArrowRight
          id="join"
          type="submit"
          kind="secondary"
          value="Join the game"
        />
      </form>
      <Link to={'/create'}>
        <Typography variant="link">Create your own quiz</Typography>
      </Link>
    </Page>
  )
}

export default HomePage
