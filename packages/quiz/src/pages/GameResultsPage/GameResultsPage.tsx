import { useQuery } from '@tanstack/react-query'
import React, { FC } from 'react'
import { useParams } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { LoadingSpinner, Page } from '../../components'

import { GameResultsPageUI } from './components'

const GameResultsPage: FC = () => {
  const { gameID } = useParams<{ gameID: string }>()

  const { getGameResults } = useQuizServiceClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['game_results', gameID],
    queryFn: () => getGameResults(gameID as string),
    enabled: !!gameID,
  })

  if (!data || isLoading || isError) {
    return (
      <Page>
        <LoadingSpinner />
      </Page>
    )
  }

  return <GameResultsPageUI results={data} />
}

export default GameResultsPage
