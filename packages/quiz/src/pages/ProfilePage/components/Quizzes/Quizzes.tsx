import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { DEFAULT_QUIZ_PAGINATION_LIMIT } from '@quiz/common'
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
import QuizTableFilter from '../../../../components/QuizTableFilter'
import { useAuthContext } from '../../../../context/auth'

const Quizzes = () => {
  const navigate = useNavigate()

  const { player } = useAuthContext()

  const { getCurrentPlayerQuizzes, createGame } = useQuizServiceClient()

  const [searchParams, setSearchParams] = useState<{
    search?: string
    limit: number
    offset: number
  }>({ limit: DEFAULT_QUIZ_PAGINATION_LIMIT, offset: 0 })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['currentPlayerQuizzes', searchParams],
    queryFn: () => getCurrentPlayerQuizzes(searchParams),
  })

  const handleSearch = (search?: string): void =>
    setSearchParams({ ...searchParams, search, offset: 0 })

  const handlePaginationChange = (newLimit: number, newOffset: number): void =>
    setSearchParams({ ...searchParams, limit: newLimit, offset: newOffset })

  const handleCreateGame = (quizId: string): void => {
    createGame(quizId).then((response) =>
      navigate(`/game?gameID=${response.id}`),
    )
  }

  return (
    <>
      <Typography variant="subtitle">
        {data?.results?.length
          ? 'Your Quizzes'
          : "You Haven't Created Any Quizzes Yet"}
      </Typography>
      <Typography variant="text" size="medium">
        {data?.results?.length
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
      <QuizTableFilter onSearch={handleSearch} />
      {!isLoading && !isError && data.results ? (
        <QuizTable
          items={data.results}
          pagination={{
            total: data.total ?? 0,
            limit: data.limit ?? DEFAULT_QUIZ_PAGINATION_LIMIT,
            offset: data.offset ?? 0,
          }}
          playerId={player?.id}
          onPagination={handlePaginationChange}
          onEdit={(quizId) => navigate(`/quiz/${quizId}`)}
          onHostGame={handleCreateGame}
        />
      ) : (
        <LoadingSpinner />
      )}
    </>
  )
}

export default Quizzes
