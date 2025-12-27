import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GAME_PIN_LENGTH, GAME_PIN_REGEX } from '@quiz/common'
import type { FC, FormEvent, MouseEvent } from 'react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ApiError } from '../../api/api.utils.ts'
import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import KlurigoIcon from '../../assets/images/klurigo-icon.svg'
import {
  IconButtonArrowRight,
  Page,
  PageProminentIcon,
  TextField,
  Typography,
} from '../../components'
import { useAuthContext } from '../../context/auth'
import { classNames } from '../../utils/helpers.ts'

import styles from './HomePage.module.scss'

/**
 * Randomized, playful tagline fragments shown beneath the page title.
 *
 * The component picks one message at render time and keeps it stable for the
 * lifetime of the component instance.
 */
const MESSAGES = [
  'Ready to show off your skills? Let’s go!',
  'Think you’ve got what it takes?',
  'The clock is ticking! Are you prepared?',
  'Time to put your knowledge to the test!',
  'Get your game face on. It’s time to win!',
  'Eyes on the prize! Are you ready?',
]

/**
 * The Klurigo home page.
 *
 * Responsibilities:
 * - Presents the primary join flow where a player enters a Game PIN and proceeds to game authentication.
 * - If the current client already has an active game session, presents a "Resume game" call-to-action
 *   to re-authenticate and continue without re-entering the PIN.
 * - Provides a secondary call-to-action to either create a quiz (authenticated) or log in (unauthenticated).
 */
const HomePage: FC = () => {
  /**
   * Auth state for the current client.
   *
   * `game` may contain game-scoped tokens and metadata, used here to determine whether there is an active
   * session that can be resumed.
   */
  const { isUserAuthenticated, game, revokeGame } = useAuthContext()

  /**
   * Quiz service client providing API operations used on the home page.
   *
   * `authenticateGame` is used to re-authenticate a previously joined game session by game id.
   */
  const { authenticateGame } = useQuizServiceClient()

  /**
   * Router navigation helper used to move the user into the relevant flow:
   * - `/auth/game?pin=...` when joining via Game PIN
   * - `/game` when resuming an existing session
   */
  const navigate = useNavigate()

  /**
   * Controlled value for the Game PIN input.
   */
  const [gamePIN, setGamePIN] = useState<string>()

  /**
   * Tracks whether the Game PIN input is currently valid according to the TextField validation rules.
   *
   * This is used to enable/disable the "Join the game" submit button.
   */
  const [gamePINValid, setGamePINValid] = useState<boolean>(false)

  /**
   * The active game id for the current client session, if present.
   *
   * When set, the UI renders a "Resume game" button that allows the client to re-authenticate and
   * continue the active session.
   */
  const activeGameId = useMemo(() => game?.ACCESS?.gameId, [game])

  /**
   * A stable, randomly selected pep-talk message displayed beneath the page title.
   *
   * The message is selected once and memoized for the lifetime of the component instance.
   */
  const message = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/purity
      `Do you feel confident? ${MESSAGES[Math.floor(Math.random() * MESSAGES.length)]}`,
    [],
  )

  /**
   * Resumes an already active game session.
   *
   * Flow:
   * - Prevents default button behavior.
   * - Requires an `activeGameId` to exist (should always be true if the resume CTA is visible).
   * - Calls `authenticateGame` to refresh/confirm the game session.
   * - Navigates to `/game` on success.
   * - If authentication fails with 401, revokes the current game token(s) to force a clean state.
   *
   * @param event - The click event triggered by the "Resume game" button.
   * @throws Error if the handler runs without an active game id.
   */
  const handleRejoinGame = (event: MouseEvent) => {
    event.preventDefault()

    if (!activeGameId) {
      throw new Error('No active game was found')
    }

    authenticateGame({ gameId: activeGameId })
      .then(() => navigate('/game'))
      .catch((error) => {
        if (error instanceof ApiError && error.status === 401) {
          revokeGame()
        }
      })
  }

  /**
   * Handles submission of the join form.
   *
   * Flow:
   * - Prevents default form submission.
   * - If a Game PIN is present, navigates to the game authentication route,
   *   passing the pin in the query string.
   *
   * @param event - The form submission event.
   */
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

      {activeGameId && (
        <div className={styles.resumeGameWrapper}>
          <button
            type="button"
            className={styles.resumeGameButton}
            onClick={handleRejoinGame}>
            <div className={styles.resumeGameSpacing} />
            <div className={styles.resumeGameContent}>
              <div className={styles.resumeGameContentTitle}>Resume game</div>
              <div className={styles.resumeGameContentSubtitle}>
                Jump back in where you left off
              </div>
            </div>
            <div className={styles.resumeGameIcon}>
              <FontAwesomeIcon icon={faArrowRight} />
            </div>
          </button>
        </div>
      )}

      <form
        className={classNames(styles.joinForm, styles.form)}
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
