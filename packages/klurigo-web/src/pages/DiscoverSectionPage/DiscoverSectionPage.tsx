import { type FC, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useKlurigoServiceClient } from '../../api'
import { isDiscoverySectionKey } from '../../utils/discovery.utils'
import { useResponsiveInfiniteOffsetQuery } from '../../utils/hooks'

import { DiscoverSectionPageUI } from './components'

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

  const {
    items: quizzes,
    isLoading,
    isError,
    hasMore,
    isLoadingMore,
    loadMore,
  } = useResponsiveInfiniteOffsetQuery({
    queryKey: ['discoverSection', sectionKey],
    queryFn: ({ limit, offset }) =>
      getSectionQuizzes(sectionKey!, { limit, offset }),
    getResults: (page) => page.results,
    getTotal: (page) => page.snapshotTotal,
    pageSize: {
      desktop: 20,
      tablet: 15,
      mobile: 10,
    },
    enabled: sectionKey !== null,
  })

  return (
    <DiscoverSectionPageUI
      sectionKey={sectionKey}
      quizzes={quizzes}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={!!hasMore}
      onLoadMore={loadMore}
      isError={isError}
    />
  )
}

export default DiscoverSectionPage
