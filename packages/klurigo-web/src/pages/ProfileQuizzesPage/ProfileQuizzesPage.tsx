import type { QuizResponseDto } from '@klurigo/common'
import { useQuery } from '@tanstack/react-query'
import type { FC } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useKlurigoServiceClient } from '../../api'
import { DeviceType } from '../../utils/device-size.types'
import { useDeviceSizeType } from '../../utils/useDeviceSizeType'
import { useQuizzesSearchOptions } from '../../utils/useQuizzesSearchOptions'

import { ProfileQuizzesPageUI } from './components'

const ProfileQuizzesPage: FC = () => {
  const navigate = useNavigate()

  const { getProfileQuizzes } = useKlurigoServiceClient()
  const { options, setOptions } = useQuizzesSearchOptions()

  const deviceType = useDeviceSizeType()

  // Calculate items per page based on device to avoid partial rows
  // Desktop: 4 cols × 5 rows = 20
  // Tablet: 3 cols × 5 rows = 15
  // Mobile: 2 cols × 5 rows = 10
  const itemsPerPage = useMemo(() => {
    if (deviceType === DeviceType.Desktop) return 20
    if (deviceType === DeviceType.Tablet) return 15
    return 10
  }, [deviceType])

  const [offset, setOffset] = useState(0)
  const [allQuizzes, setAllQuizzes] = useState<QuizResponseDto[]>([])
  const [total, setTotal] = useState(0)

  const { isLoading, isError } = useQuery({
    queryKey: ['myProfileQuizzes', options, offset, itemsPerPage],
    queryFn: async () => {
      const data = await getProfileQuizzes({
        ...options,
        limit: itemsPerPage,
        offset,
      })
      setTotal(data.total)
      setAllQuizzes((prev) =>
        offset === 0 ? data.results : [...prev, ...data.results],
      )
      return data
    },
  })

  const handleLoadMore = useCallback(() => {
    setOffset((prev) => prev + itemsPerPage)
  }, [itemsPerPage])

  const handleChangeSearchParams = useCallback(
    (newOptions: Partial<typeof options>) => {
      setOffset(0)
      setOptions(newOptions as typeof options)
    },
    [setOptions],
  )

  const hasMore = allQuizzes.length < total

  return (
    <ProfileQuizzesPageUI
      quizzes={allQuizzes}
      filter={options}
      isLoading={isLoading && offset === 0}
      isError={isError}
      hasMore={hasMore}
      skeletonCount={itemsPerPage}
      onLoadMore={handleLoadMore}
      onChangeSearchParams={handleChangeSearchParams}
      onCreateQuiz={() => navigate('/quiz/create')}
    />
  )
}

export default ProfileQuizzesPage
