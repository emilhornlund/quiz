import { useQuery } from '@tanstack/react-query'
import type { FC } from 'react'
import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { LoadingSpinner, Page } from '../../components'
import { useAuthContext } from '../../context/auth'

import { GameResultsPageUI } from './components'

const GameResultsPage: FC = () => {
  const navigate = useNavigate()

  const { gameID } = useParams<{ gameID: string }>()

  const { getGameResults } = useQuizServiceClient()

  const { user } = useAuthContext()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['game_results', gameID],
    queryFn: () => getGameResults(gameID as string),
    enabled: !!gameID,
    retry: false,
  })

  useEffect(() => {
    if (isError) {
      navigate(-1)
    }
  }, [isError, navigate])

  const currentParticipantId = useMemo(() => user?.ACCESS.sub, [user])

  if (!data || !currentParticipantId || isLoading || isError) {
    return (
      <Page>
        <LoadingSpinner />
      </Page>
    )
  }

  return (
    <GameResultsPageUI
      results={data}
      currentParticipantId={currentParticipantId}
    />
  )
}

export default GameResultsPage
