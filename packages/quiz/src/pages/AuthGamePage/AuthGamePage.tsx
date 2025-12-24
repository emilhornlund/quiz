import type { FC } from 'react'
import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { LoadingSpinner, Page } from '../../components'
import { notifyError } from '../../utils/notification.ts'

const AuthGamePage: FC = () => {
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  const { authenticateGame } = useQuizServiceClient()

  const hasRequestedRef = useRef(false)

  useEffect(() => {
    const gameId = searchParams.get('id') || undefined
    const gamePIN = searchParams.get('pin') || undefined

    if ((!gameId && !gamePIN) || hasRequestedRef.current) return

    hasRequestedRef.current = true

    authenticateGame({ gameId, gamePIN })
      .then(() => {
        navigate('/join')
      })
      .catch(() => {
        navigate('/')
        notifyError('Game not found. Please try again.')
      })
  }, [searchParams, authenticateGame, navigate])

  return (
    <Page>
      <LoadingSpinner />
    </Page>
  )
}

export default AuthGamePage
