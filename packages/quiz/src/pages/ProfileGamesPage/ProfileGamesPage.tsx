import { useQuery } from '@tanstack/react-query'
import React, { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { LoadingSpinner, Page } from '../../components'

import ProfileGamesPageUI from './ProfileGamesPageUI'

const ProfileGamesPage: FC = () => {
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useState<{
    limit: number
    offset: number
  }>({ limit: 5, offset: 0 })

  const { getProfileGames } = useQuizServiceClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['myProfileGames', searchParams],
    queryFn: () => getProfileGames(searchParams),
  })

  useEffect(() => {
    if (isError) {
      navigate('/')
    }
  }, [isError, navigate])

  if (isLoading || !data) {
    return (
      <Page align="center" discover profile>
        <LoadingSpinner />
      </Page>
    )
  }

  return (
    <ProfileGamesPageUI
      items={data.results}
      total={data.total}
      limit={data.limit}
      offset={data.offset}
      onChangePagination={(limit, offset) => setSearchParams({ limit, offset })}
    />
  )
}

export default ProfileGamesPage
