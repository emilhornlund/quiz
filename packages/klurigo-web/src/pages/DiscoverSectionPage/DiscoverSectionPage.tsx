import type { DiscoveryQuizCardDto } from '@klurigo/common'
import { useQuery } from '@tanstack/react-query'
import { type FC, useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useKlurigoServiceClient } from '../../api'
import { isDiscoverySectionKey } from '../../utils/discovery.utils'

import { DiscoverSectionPageUI } from './components'

/** Default number of quiz cards fetched per page. */
const DEFAULT_LIMIT = 20

/**
 * Container component for the discovery section "See All" page.
 *
 * Reads the :key route parameter to identify which discovery section to display.
 * Uses React Query with the query key ['discoverSection', key, limit, offset]
 * to fetch paginated quiz data from GET /discover/section/:key.
 *
 * Pagination state is managed via limit and offset. Each "Load more" action
 * increments offset by limit and appends the new results to the accumulated
 * list, preserving the snapshot ordering from the backend. The "Load more"
 * button is hidden when offset + results.length >= snapshotTotal.
 *
 * snapshotTotal reflects the number of scored entries stored in the snapshot
 * for this rail — bounded by snapshot capacity constants, not a live database
 * row count.
 *
 * If the section key is unknown or the backend returns an error, a graceful
 * empty/error state is shown without crashing or spinning indefinitely.
 */
const DiscoverSectionPage: FC = () => {
  const { key: rawKey = '' } = useParams<{ key: string }>()
  const { getSectionQuizzes } = useKlurigoServiceClient()

  const sectionKey = useMemo(
    () => (isDiscoverySectionKey(rawKey) ? rawKey : null),
    [rawKey],
  )

  const [offset, setOffset] = useState(0)
  const [allQuizzes, setAllQuizzes] = useState<DiscoveryQuizCardDto[]>([])
  const [snapshotTotal, setSnapshotTotal] = useState(0)

  const { isLoading, isError } = useQuery({
    queryKey: ['discoverSection', sectionKey, DEFAULT_LIMIT, offset],
    queryFn: async () => {
      const data = await getSectionQuizzes(sectionKey!, {
        limit: DEFAULT_LIMIT,
        offset,
      })
      setSnapshotTotal(data.snapshotTotal)
      setAllQuizzes((prev) =>
        offset === 0 ? data.results : [...prev, ...data.results],
      )
      return data
    },
    enabled: sectionKey !== null,
    retry: false,
  })

  const handleLoadMore = useCallback(() => {
    setOffset((prev) => prev + DEFAULT_LIMIT)
  }, [])

  const hasMore = offset + allQuizzes.length < snapshotTotal

  return (
    <DiscoverSectionPageUI
      sectionKey={sectionKey}
      quizzes={allQuizzes}
      isLoading={isLoading && offset === 0}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
      isError={isError}
    />
  )
}

export default DiscoverSectionPage
