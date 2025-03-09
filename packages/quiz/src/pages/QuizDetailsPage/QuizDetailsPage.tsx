import { useQuery } from '@tanstack/react-query'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { useAuthContext } from '../../context/auth'

import { QuizDetailsPageUI } from './components'

const QuizDetailsPage: FC = () => {
  const navigate = useNavigate()

  const { quizId } = useParams<{ quizId: string }>()

  const { player } = useAuthContext()

  const { getQuiz, deleteQuiz, createGame } = useQuizServiceClient()

  const {
    data: originalQuiz,
    isLoading: isLoadingQuiz,
    isError: hasQuizLoadingError,
  } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuiz(quizId as string),
    enabled: !!quizId,
  })

  useEffect(() => {
    if (hasQuizLoadingError) {
      navigate('/player/profile')
    }
  }, [hasQuizLoadingError, navigate])

  const isOwner = useMemo(
    () => player?.id === originalQuiz?.author?.id,
    [player, originalQuiz],
  )

  const [isHostGameLoading, setIsHostGameLoading] = useState(false)

  const handleCreateGame = (): void => {
    if (quizId) {
      setIsHostGameLoading(true)
      createGame(quizId)
        .then((response) => navigate(`/game?gameID=${response.id}`))
        .finally(() => setIsHostGameLoading(false))
    }
  }

  const handleEditQuiz = () => {
    if (quizId) {
      navigate(`/quiz/details/${quizId}/edit`)
    }
  }

  const [isDeleteQuizLoading, setIsDeleteQuizLoading] = useState(false)

  const handleDeleteQuiz = (): void => {
    if (quizId) {
      setIsDeleteQuizLoading(true)
      deleteQuiz(quizId)
        .then(() => navigate('/player/profile'))
        .finally(() => setIsDeleteQuizLoading(false))
    }
  }

  return (
    <QuizDetailsPageUI
      quiz={originalQuiz}
      isOwner={isOwner}
      isLoadingQuiz={isLoadingQuiz}
      isHostGameLoading={isHostGameLoading}
      isDeleteQuizLoading={isDeleteQuizLoading}
      onHostGame={handleCreateGame}
      onEditQuiz={handleEditQuiz}
      onDeleteQuiz={handleDeleteQuiz}
    />
  )
}

export default QuizDetailsPage
