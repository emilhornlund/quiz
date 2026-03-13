import type { FC } from 'react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { useKlurigoServiceClient } from '../../api'
import { useResponsiveInfiniteOffsetQuery } from '../../utils/hooks'
import { useQuizzesSearchOptions } from '../../utils/useQuizzesSearchOptions'

import { ProfileQuizzesPageUI } from './components'

const ProfileQuizzesPage: FC = () => {
  const navigate = useNavigate()

  const { getProfileQuizzes } = useKlurigoServiceClient()
  const { options, setOptions } = useQuizzesSearchOptions()

  const {
    items: quizzes,
    itemsPerPage,
    isLoading,
    isError,
    hasMore,
    isLoadingMore,
    loadMore,
  } = useResponsiveInfiniteOffsetQuery({
    queryKey: [
      'myProfileQuizzes',
      options.search,
      options.visibility,
      options.category,
      options.languageCode,
      options.mode,
      options.sort,
      options.order,
    ],
    queryFn: ({ limit, offset }) =>
      getProfileQuizzes({ ...options, limit, offset }),
    getResults: (page) => page.results,
    getTotal: (page) => page.total,
    pageSize: {
      desktop: 20,
      tablet: 15,
      mobile: 10,
    },
  })

  const handleChangeSearchParams = useCallback(
    (newOptions: Partial<typeof options>) => {
      setOptions(newOptions as typeof options)
    },
    [setOptions],
  )

  return (
    <ProfileQuizzesPageUI
      quizzes={quizzes}
      filter={options}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      isError={isError}
      hasMore={!!hasMore}
      skeletonCount={itemsPerPage ?? 20}
      onLoadMore={loadMore}
      onChangeSearchParams={handleChangeSearchParams}
      onCreateQuiz={() => navigate('/quiz/create')}
    />
  )
}

export default ProfileQuizzesPage
