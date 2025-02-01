import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../../../api/use-quiz-service-client.tsx'
import {
  Button,
  LoadingSpinner,
  QuizTable,
  Typography,
} from '../../../../components'
import { useAuthContext } from '../../../../context/auth'

const Quizzes = () => {
  const navigate = useNavigate()

  const { player } = useAuthContext()

  const { getCurrentPlayerQuizzes, createGame } = useQuizServiceClient()

  const [searchParams, setSearchParams] = useState<{
    limit?: number
    offset?: number
  }>({ limit: 5, offset: 0 })

  const {
    data: { results: quizzes, total = 0, limit = 0, offset = 0 } = {},
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['currentPlayerQuizzes', searchParams],
    queryFn: () => getCurrentPlayerQuizzes(searchParams),
  })

  const handlePaginationChange = (newLimit: number, newOffset: number): void =>
    setSearchParams({ ...searchParams, limit: newLimit, offset: newOffset })

  const handleCreateGame = (quizId: string): void => {
    createGame(quizId).then((response) =>
      navigate(`/game?gameID=${response.id}`),
    )
  }

  if (isLoading || isError) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Typography variant="subtitle">
        {quizzes?.length
          ? 'Your Quizzes'
          : "You Haven't Created Any Quizzes Yet"}
      </Typography>
      <Typography variant="text" size="medium">
        {quizzes?.length
          ? "Here's a list of your quizzes. You can edit them or host live games as needed."
          : 'Start creating engaging quizzes and share them with your audience.\n' +
            'Your creations will appear here!'}
      </Typography>
      <Button
        id="create-quiz-button"
        type="button"
        kind="call-to-action"
        size="small"
        value="Create New Quiz"
        icon={faPlus}
        iconPosition="leading"
        onClick={() => navigate('/quiz/create')}
      />
      {!!quizzes?.length && (
        <QuizTable
          items={quizzes}
          pagination={{
            total,
            limit,
            offset,
          }}
          playerId={player?.id}
          onPagination={handlePaginationChange}
          onEdit={(quizId) => navigate(`/quiz/${quizId}`)}
          onHostGame={handleCreateGame}
        />
      )}
    </>
  )
}

export default Quizzes
